const Template = require('../models/Template');
const ActivityLog = require('../models/ActivityLog');
const mongoose = require('mongoose');
const User = require('../models/User');

// helper: get user's system role and id
const getUserAndRoles = async (req) => {
  const userId = req.user?.id || req.user?._id;
  if (!userId) return { userId: null, isAdmin: false, userDoc: null, roles: null };
  const userDoc = await User.findById(userId);
  const roles = userDoc && typeof userDoc.getRoles === 'function' ? await userDoc.getRoles() : null;
  const sysRole = roles?.systemRole;
  const isAdmin = sysRole === 'admin' || sysRole === 'super_admin' || sysRole === 'superadmin';
  return { userId: String(userId), isAdmin, userDoc, roles };
};

// Server-side sanitizer for payload safety (defense in depth)
const ALLOWED_ROLES = ['user','manager','team_member','admin','superadmin'];
function sanitizeTemplatePayload(input = {}) {
  const payload = { ...input };
  // remove forbidden fields
  delete payload.createdBy;
  delete payload.isSystem;

  // tags: ensure array of strings with length <= 50
  if (Array.isArray(payload.tags)) {
    payload.tags = payload.tags
      .filter((t) => typeof t === 'string')
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && t.length <= 50)
      .slice(0, 20);
  }

  // accessControl: ensure proper shapes
  if (payload.accessControl && typeof payload.accessControl === 'object') {
    const ac = payload.accessControl;
    // allowedUsers/workspaces must be valid ObjectIds
    if (Array.isArray(ac.allowedUsers)) {
      ac.allowedUsers = ac.allowedUsers.filter((id) => mongoose.Types.ObjectId.isValid(id));
    }
    if (Array.isArray(ac.allowedWorkspaces)) {
      ac.allowedWorkspaces = ac.allowedWorkspaces.filter((id) => mongoose.Types.ObjectId.isValid(id));
    }
    // allowedRoles must be in enum
    if (Array.isArray(ac.allowedRoles)) {
      ac.allowedRoles = ac.allowedRoles.filter((r) => ALLOWED_ROLES.includes(r));
    }
    payload.accessControl = ac;
  }

  // content must remain an object if provided
  if (payload.content && typeof payload.content !== 'object') {
    delete payload.content;
  }

  return payload;
}

// Standardized success response
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });

// Standardized error passthrough
const handleError = (next, error) => {
  // Let global error middleware format the error response
  next(error);
};

exports.list = async (req, res, next) => {
  try {
    const { type, category, q, isPublic, status = 'active', limit = 50, workspaceId, scope } = req.query;
    const { userId, roles, isAdmin } = await getUserAndRoles(req);

    // Build query
    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';

    // Access control: only return items user can access, unless admin explicitly requests full scope
    const adminWantsAll = isAdmin && scope === 'all';
    if (!adminWantsAll) {
      const accessOr = [
        { isPublic: true },
        { createdBy: userId },
        { 'accessControl.allowedUsers': userId }
      ];
      if (workspaceId) accessOr.push({ 'accessControl.allowedWorkspaces': workspaceId });
      if (roles?.systemRole) accessOr.push({ 'accessControl.allowedRoles': roles.systemRole });
      query.$or = accessOr;
    }

    let cursor;
    if (q) {
      cursor = Template.search(q, { type, category, isPublic: query.isPublic, limit: Number(limit) });
    } else {
      cursor = Template.find(query).sort({ createdAt: -1 }).limit(Number(limit));
    }

    // Populate owner info for display (name/email)
    const items = await cursor.populate('createdBy', 'name email displayName');
    return ok(res, items);
  } catch (error) {
    handleError(next, error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('[templates.getById] incoming', { id });
    const item = await Template.findById(id).populate('createdBy', 'name email displayName');
    if (!item) {
      console.warn('[templates.getById] not found', { id });
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    const { userId, isAdmin } = await getUserAndRoles(req);

    const createdById = (item.createdBy && item.createdBy._id) ? item.createdBy._id : item.createdBy;
    const canAccess = item.isSystem || item.isPublic ||
      String(createdById) === String(userId) ||
      (Array.isArray(item.accessControl?.allowedUsers) && item.accessControl.allowedUsers.some(u => String(u) === String(userId)));
    if (!canAccess && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Increment views at most once per authenticated user
    // Prefer req.user._id if available (usually an ObjectId), else fall back to userId from getUserAndRoles
    const viewerIdRaw = (req.user?._id || req.user?.id) ?? userId;
    let updated = item;
    if (viewerIdRaw && mongoose.Types.ObjectId.isValid(String(viewerIdRaw))) {
      const viewerObjId = new mongoose.Types.ObjectId(String(viewerIdRaw));
      console.log('[templates.getById] attempt unique increment', { id, viewerId: String(viewerIdRaw) });
      const resUpdate = await Template.updateOne(
        { _id: id, viewedBy: { $ne: viewerObjId } },
        { $addToSet: { viewedBy: viewerObjId }, $inc: { views: 1 } }
      );
      if (resUpdate.modifiedCount > 0) {
        console.log('[templates.getById] incremented', { id, viewerId: String(viewerIdRaw) });
        updated = await Template.findById(id).populate('createdBy', 'name email displayName');
      } else {
        console.log('[templates.getById] already viewed, no increment', { id, viewerId: String(viewerIdRaw) });
      }
    } else if (userId && String(createdById) === String(userId)) {
      // Owner fallback: if current user is the owner but userId is not a valid ObjectId,
      // record exactly one owner view using the template's createdBy ObjectId
      const ownerObjId = new mongoose.Types.ObjectId(String(createdById));
      console.log('[templates.getById] owner fallback increment', { id, owner: String(createdById) });
      const resUpdate = await Template.updateOne(
        { _id: id, viewedBy: { $ne: ownerObjId } },
        { $addToSet: { viewedBy: ownerObjId }, $inc: { views: 1 } }
      );
      if (resUpdate.modifiedCount > 0) {
        updated = await Template.findById(id).populate('createdBy', 'name email displayName');
      }
    }
    return ok(res, updated);
  } catch (error) {
    handleError(next, error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const adminId = req.user?._id || req.user?.id; // auth.middleware attaches user
    if (!adminId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const payload = sanitizeTemplatePayload(req.body);
    const doc = Template.createTemplate(payload, adminId);
    await doc.save();

    // Log activity for real-time updates
    try {
      await ActivityLog.logActivity({
        userId: adminId,
        action: 'template_create',
        description: `Created template: ${doc.name}`,
        entity: { type: 'Template', id: doc._id, name: doc.name },
        metadata: {
          isPublic: !!doc.isPublic,
          type: doc.type,
          category: doc.category,
          ipAddress: req.ip,
        },
      });
    } catch (e) {
      // Don't fail request if activity logging fails
    }

    return ok(res, doc, 201);
  } catch (error) {
    handleError(next, error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, isAdmin } = await getUserAndRoles(req);

    // operation-based updates
    const op = req.body?.op;
    if (op === 'increment_views') {
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      if (!mongoose.Types.ObjectId.isValid(String(userId))) {
        const existingDoc = await Template.findById(id);
        return ok(res, existingDoc);
      }
      // Increment only if this user hasn't viewed before
      const viewerObjId = new mongoose.Types.ObjectId(String(userId));
      const resUpdate = await Template.updateOne(
        { _id: id, viewedBy: { $ne: viewerObjId } },
        { $addToSet: { viewedBy: viewerObjId }, $inc: { views: 1 } },
        { upsert: false }
      );
      if (resUpdate.matchedCount === 0) return res.status(404).json({ success: false, message: 'Template not found' });
      if (resUpdate.modifiedCount === 0) {
        const existingDoc = await Template.findById(id);
        return ok(res, existingDoc);
      }
      const updatedDoc = await Template.findById(id);
      return ok(res, updatedDoc);
    }
    if (op === 'toggle_like') {
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const existing = await Template.findById(id).select('_id likedBy');
      if (!existing) return res.status(404).json({ success: false, message: 'Template not found' });
      const hasLiked = Array.isArray(existing.likedBy) && existing.likedBy.some((u) => String(u) === String(userId));
      const update = hasLiked ? { $pull: { likedBy: userId } } : { $addToSet: { likedBy: userId } };
      const updated = await Template.findByIdAndUpdate(id, update, { new: true, runValidators: false })
      .populate('createdBy', 'name email displayName')
      .populate('likedBy', 'name displayName')
      .populate('viewedBy', 'name displayName');
      if (!updated) return res.status(404).json({ success: false, message: 'Template not found' });
      return ok(res, updated);
    }

    // default: partial update of fields
    const payload = sanitizeTemplatePayload(req.body);

    const existing = await Template.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Template not found' });

    // Only owner or admin can update. System templates require admin.
    
    const isOwner = String(existing.createdBy) === String(userId);
    if (existing.isSystem && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only admins can modify system templates' });
    }
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only owner or admin can update this template' });
    }

    const updated = await Template.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
      .populate('createdBy', 'name email displayName')
      .populate('likedBy', 'name displayName')
      .populate('viewedBy', 'name displayName');
    if (!updated) return res.status(404).json({ success: false, message: 'Template not found' });
    return ok(res, updated);
  } catch (error) {
    handleError(next, error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, isAdmin } = await getUserAndRoles(req);
    const existing = await Template.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Template not found' });
    const isOwner = String(existing.createdBy) === String(userId);
    if (existing.isSystem && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only admins can delete system templates' });
    }
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only owner or admin can delete this template' });
    }
    await existing.deleteOne();
    return ok(res, { id });
  } catch (error) {
    handleError(next, error);
  }
};

// Increment views
exports.incrementViews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = await getUserAndRoles(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!mongoose.Types.ObjectId.isValid(String(userId))) {
      const existing = await Template.findById(id).populate('createdBy', 'name email displayName');
      return ok(res, existing);
    }
    const viewerObjId = new mongoose.Types.ObjectId(String(userId));
    const resUpdate = await Template.updateOne(
      { _id: id, viewedBy: { $ne: viewerObjId } },
      { $addToSet: { viewedBy: viewerObjId }, $inc: { views: 1 } }
    );
    if (resUpdate.matchedCount === 0) return res.status(404).json({ success: false, message: 'Template not found' });
    if (resUpdate.modifiedCount === 0) {
      const existing = await Template.findById(id).populate('createdBy', 'name email displayName');
      return ok(res, existing);
    }
    const updated = await Template.findById(id).populate('createdBy', 'name email displayName');
    return ok(res, updated);
  } catch (error) {
    handleError(next, error);
  }
};

// Toggle like for current user
exports.toggleLike = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { id } = req.params;
    console.log('[templates.toggleLike] incoming', { id, userId: String(userId) });

    // Determine whether the user has already liked the template
    const existing = await Template.findById(id).select('_id likedBy');
    if (!existing) {
      console.warn('[templates.toggleLike] not found', { id });
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const uid = String(userId);
    const hasLiked = Array.isArray(existing.likedBy) && existing.likedBy.some((u) => String(u) === uid);

    // Use atomic update to avoid full-document validation (e.g., required content)
    const update = hasLiked
      ? { $pull: { likedBy: userId } }
      : { $addToSet: { likedBy: userId } };

    const updated = await Template.findByIdAndUpdate(id, update, { new: true })
      .populate('createdBy', 'name email displayName')
      .populate('likedBy', 'name displayName')
      .populate('viewedBy', 'name displayName');
    if (!updated) {
      console.warn('[templates.toggleLike] not found after update', { id });
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    console.log('[templates.toggleLike] saved', { id, likes: Array.isArray(updated.likedBy) ? updated.likedBy.length : 0 });
    return ok(res, updated);
  } catch (error) {
    handleError(next, error);
  }
};
