const Project = require('../models/Project');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

// Get all projects for user
exports.getAllProjects = async (req, res) => {
    try {
        const { status, priority, workspaceId } = req.query;
        const userId = req.user.id;

        // Get user roles to find accessible projects
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();

        // Build query based on user's project roles
        const projectIds = userRoles.projects.map(proj => proj.project);

        let query = { _id: { $in: projectIds } };
        
        // Apply filters
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (workspaceId) {
            // Additional workspace filtering would go here
            // For now, we'll keep the basic project query
        }

        const projects = await Project.find(query)
            .populate('owner', 'name email avatar')
            .populate('team.user', 'name email avatar')
            .sort({ updatedAt: -1 });

        // Enrich with user's role for each project
        const enrichedProjects = projects.map(project => {
            const userRole = userRoles.projects.find(proj => 
                proj.project.toString() === project._id.toString()
            );

            return {
                ...project.toObject(),
                userRole: userRole ? userRole.role : null,
                userPermissions: userRole ? userRole.permissions : null
            };
        });

        sendResponse(res, 200, true, 'Projects retrieved successfully', {
            projects: enrichedProjects,
            count: enrichedProjects.length
        });
    } catch (error) {
        logger.error('Get projects error:', error);
        sendResponse(res, 500, false, 'Server error retrieving projects');
    }
};

// Get single project with detailed information
exports.getProject = async (req, res) => {
    try {
        const { id: projectId } = req.params;
        const userId = req.user.id;

        // Check if user has access to this project
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasProjectRole(projectId)) {
            return sendResponse(res, 403, false, 'Access denied to this project');
        }

        const project = await Project.findById(projectId)
            .populate('owner', 'name email avatar')
            .populate('team.user', 'name email avatar');

        if (!project) {
            return sendResponse(res, 404, false, 'Project not found');
        }

        // Get project statistics
        const projectService = require('../services/project.service');
        const [stats, activity] = await Promise.all([
            projectService.getProjectStats(projectId),
            projectService.getProjectActivity(projectId, 10)
        ]);

        // Get user's role and permissions for this project
        const userProjectRole = userRoles.projects.find(proj => 
            proj.project.toString() === projectId
        );

        sendResponse(res, 200, true, 'Project retrieved successfully', {
            project: {
                ...project.toObject(),
                stats,
                recentActivity: activity
            },
            userRole: userProjectRole.role,
            userPermissions: userProjectRole.permissions
        });
    } catch (error) {
        logger.error('Get project error:', error);
        sendResponse(res, 500, false, 'Server error retrieving project');
    }
};

// Create new project
exports.createProject = async (req, res) => {
    try {
        const { 
            name, 
            description, 
            goal, 
            priority, 
            targetEndDate, 
            workspaceId,
            budget,
            tags 
        } = req.body;
        const userId = req.user.id;

        // Check workspace permissions if workspaceId provided
        if (workspaceId) {
            const user = await User.findById(userId);
            const userRoles = await user.getRoles();
            
            if (!userRoles.hasWorkspaceRole(workspaceId, 'member')) {
                return sendResponse(res, 403, false, 'Access denied to workspace');
            }
        }

        const project = await Project.create({
            name,
            description,
            goal,
            priority: priority || 'medium',
            targetEndDate: new Date(targetEndDate),
            owner: userId,
            team: [{
                user: userId,
                role: 'member'
            }],
            budget: budget || {},
            tags: tags || []
        });

        await project.populate('owner', 'name email avatar');

        // Add user role for this project
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        await userRoles.addProjectRole(project._id, 'owner', {
            canEditProject: true,
            canDeleteProject: true,
            canManageMembers: true,
            canCreateBoards: true,
            canDeleteBoards: true,
            canManageSettings: true
        });

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'project_create',
            description: `Created project: ${name}`,
            entity: { type: 'Project', id: project._id, name },
            metadata: {
                goal,
                priority,
                targetEndDate,
                ipAddress: req.ip
            }
        });

        logger.info(`Project created: ${name} by ${req.user.email}`);

        sendResponse(res, 201, true, 'Project created successfully', {
            project: project.toObject(),
            userRole: 'owner'
        });
    } catch (error) {
        logger.error('Create project error:', error);
        sendResponse(res, 500, false, 'Server error creating project');
    }
};

// Update project
exports.updateProject = async (req, res) => {
    try {
        const { id: projectId } = req.params;
        const { 
            name, 
            description, 
            goal, 
            status, 
            priority, 
            targetEndDate,
            budget,
            tags 
        } = req.body;
        const userId = req.user.id;

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        const projectRole = userRoles.projects.find(proj => 
            proj.project.toString() === projectId
        );

        if (!projectRole || !projectRole.permissions.canEditProject) {
            return sendResponse(res, 403, false, 'Insufficient permissions to edit project');
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return sendResponse(res, 404, false, 'Project not found');
        }

        // Store old values for audit
        const oldValues = {
            name: project.name,
            status: project.status,
            priority: project.priority,
            targetEndDate: project.targetEndDate
        };

        // Update project fields
        if (name) project.name = name;
        if (description) project.description = description;
        if (goal) project.goal = goal;
        if (priority) project.priority = priority;
        if (targetEndDate) project.targetEndDate = new Date(targetEndDate);
        if (budget) Object.assign(project.budget, budget);
        if (tags) project.tags = tags;

        // Handle status changes
        if (status && status !== project.status) {
            project.status = status;
            
            if (status === 'completed') {
                project.actualEndDate = new Date();
            } else if (project.status === 'completed' && status !== 'completed') {
                project.actualEndDate = null;
            }
        }

        await project.save();
        await project.populate('owner', 'name email avatar');
        await project.populate('team.user', 'name email avatar');

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'project_update',
            description: `Updated project: ${project.name}`,
            entity: { type: 'Project', id: projectId, name: project.name },
            metadata: {
                oldValues,
                newValues: { name, status, priority, targetEndDate },
                ipAddress: req.ip
            }
        });

        logger.info(`Project updated: ${project.name}`);

        sendResponse(res, 200, true, 'Project updated successfully', {
            project: project.toObject(),
            userRole: projectRole.role,
            userPermissions: projectRole.permissions
        });
    } catch (error) {
        logger.error('Update project error:', error);
        sendResponse(res, 500, false, 'Server error updating project');
    }
};

// Delete project
exports.deleteProject = async (req, res) => {
    try {
        const { id: projectId } = req.params;
        const userId = req.user.id;

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        const projectRole = userRoles.projects.find(proj => 
            proj.project.toString() === projectId
        );

        if (!projectRole || !projectRole.permissions.canDeleteProject) {
            return sendResponse(res, 403, false, 'Insufficient permissions to delete project');
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return sendResponse(res, 404, false, 'Project not found');
        }

        // Remove project from all user roles
        const allUsers = await User.find({});
        for (const userDoc of allUsers) {
            const roles = await userDoc.getRoles();
            const hasProjectRole = roles.projects.some(proj => 
                proj.project.toString() === projectId
            );
            
            if (hasProjectRole) {
                roles.projects = roles.projects.filter(proj => 
                    proj.project.toString() !== projectId
                );
                await roles.save();
            }
        }

        await Project.findByIdAndDelete(projectId);

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'project_delete',
            description: `Deleted project: ${project.name}`,
            entity: { type: 'Project', id: projectId, name: project.name },
            metadata: { ipAddress: req.ip },
            severity: 'warning'
        });

        logger.info(`Project deleted: ${project.name}`);

        sendResponse(res, 200, true, 'Project deleted successfully');
    } catch (error) {
        logger.error('Delete project error:', error);
        sendResponse(res, 500, false, 'Server error deleting project');
    }
};

// Add member to project
exports.addMember = async (req, res) => {
    try {
        const { id: projectId } = req.params;
        const { userId: newMemberId, role = 'member' } = req.body;
        const currentUserId = req.user.id;

        // Check permissions
        const user = await User.findById(currentUserId);
        const userRoles = await user.getRoles();
        
        const projectRole = userRoles.projects.find(proj => 
            proj.project.toString() === projectId
        );

        if (!projectRole || !projectRole.permissions.canManageMembers) {
            return sendResponse(res, 403, false, 'Insufficient permissions to manage members');
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return sendResponse(res, 404, false, 'Project not found');
        }

        // Check if user is already a member
        const isMember = project.team.some(member => 
            member.user.toString() === newMemberId
        );

        if (isMember) {
            return sendResponse(res, 400, false, 'User is already a member');
        }

        // Add member to project
        await project.addTeamMember(newMemberId, role);

        // Add role to new member
        const newMember = await User.findById(newMemberId);
        const newMemberRoles = await newMember.getRoles();
        await newMemberRoles.addProjectRole(projectId, role);

        await project.populate('team.user', 'name email avatar');

        // Log activity
        await ActivityLog.logActivity({
            userId: currentUserId,
            action: 'project_member_add',
            description: `Added member to project: ${project.name}`,
            entity: { type: 'Project', id: projectId, name: project.name },
            relatedEntities: [{ type: 'User', id: newMemberId, name: newMember.name }],
            metadata: {
                memberRole: role,
                ipAddress: req.ip
            }
        });

        logger.info(`Member added to project: ${project.name}`);

        sendResponse(res, 200, true, 'Member added successfully', {
            project: project.toObject()
        });
    } catch (error) {
        logger.error('Add member error:', error);
        sendResponse(res, 500, false, 'Server error adding member');
    }
};

// Remove member from project
exports.removeMember = async (req, res) => {
    try {
        const { id: projectId, memberId } = req.params;
        const currentUserId = req.user.id;

        // Check permissions
        const user = await User.findById(currentUserId);
        const userRoles = await user.getRoles();
        
        const projectRole = userRoles.projects.find(proj => 
            proj.project.toString() === projectId
        );

        if (!projectRole || !projectRole.permissions.canManageMembers) {
            return sendResponse(res, 403, false, 'Insufficient permissions to manage members');
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return sendResponse(res, 404, false, 'Project not found');
        }

        // Can't remove project owner
        if (project.owner.toString() === memberId) {
            return sendResponse(res, 400, false, 'Cannot remove project owner');
        }

        // Remove member from project
        await project.removeTeamMember(memberId);

        // Remove project role from user
        const member = await User.findById(memberId);
        const memberRoles = await member.getRoles();
        memberRoles.projects = memberRoles.projects.filter(proj => 
            proj.project.toString() !== projectId
        );
        await memberRoles.save();

        // Log activity
        await ActivityLog.logActivity({
            userId: currentUserId,
            action: 'project_member_remove',
            description: `Removed member from project: ${project.name}`,
            entity: { type: 'Project', id: projectId, name: project.name },
            relatedEntities: [{ type: 'User', id: memberId, name: member.name }],
            metadata: { ipAddress: req.ip }
        });

        sendResponse(res, 200, true, 'Member removed successfully');
    } catch (error) {
        logger.error('Remove member error:', error);
        sendResponse(res, 500, false, 'Server error removing member');
    }
};

// Update member role
exports.updateMemberRole = async (req, res) => {
    try {
        const { id: projectId, memberId } = req.params;
        const { role: newRole } = req.body;
        const currentUserId = req.user.id;

        // Check permissions
        const user = await User.findById(currentUserId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasProjectRole(projectId, 'admin')) {
            return sendResponse(res, 403, false, 'Admin permissions required to change member roles');
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return sendResponse(res, 404, false, 'Project not found');
        }

        // Update role in project
        const member = project.team.find(m => m.user.toString() === memberId);
        if (!member) {
            return sendResponse(res, 404, false, 'Member not found in project');
        }

        const oldRole = member.role;
        member.role = newRole;
        await project.save();

        // Update user roles
        const memberUser = await User.findById(memberId);
        const memberRoles = await memberUser.getRoles();
        await memberRoles.addProjectRole(projectId, newRole);

        // Log activity
        await ActivityLog.logActivity({
            userId: currentUserId,
            action: 'project_member_role_change',
            description: `Changed member role in project: ${project.name}`,
            entity: { type: 'Project', id: projectId, name: project.name },
            relatedEntities: [{ type: 'User', id: memberId, name: memberUser.name }],
            metadata: {
                oldRole,
                newRole,
                ipAddress: req.ip
            }
        });

        sendResponse(res, 200, true, 'Member role updated successfully', {
            memberId,
            oldRole,
            newRole
        });
    } catch (error) {
        logger.error('Update member role error:', error);
        sendResponse(res, 500, false, 'Server error updating member role');
    }
};

// Get project members with their statistics
exports.getProjectMembers = async (req, res) => {
    try {
        const { id: projectId } = req.params;
        const userId = req.user.id;

        // Check access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasProjectRole(projectId)) {
            return sendResponse(res, 403, false, 'Access denied to this project');
        }

        const projectService = require('../services/project.service');
        const members = await projectService.getProjectMembers(projectId);

        sendResponse(res, 200, true, 'Project members retrieved successfully', {
            members,
            total: members.length
        });
    } catch (error) {
        logger.error('Get project members error:', error);
        sendResponse(res, 500, false, 'Server error retrieving project members');
    }
};

// Get project insights and analytics
exports.getProjectInsights = async (req, res) => {
    try {
        const { id: projectId } = req.params;
        const userId = req.user.id;

        // Check access
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasProjectRole(projectId)) {
            return sendResponse(res, 403, false, 'Access denied to this project');
        }

        const projectService = require('../services/project.service');
        const insights = await projectService.generateProjectInsights(projectId);

        sendResponse(res, 200, true, 'Project insights retrieved successfully', {
            insights
        });
    } catch (error) {
        logger.error('Get project insights error:', error);
        sendResponse(res, 500, false, 'Server error retrieving project insights');
    }
};

// Archive project
exports.archiveProject = async (req, res) => {
    try {
        const { id: projectId } = req.params;
        const userId = req.user.id;

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasProjectRole(projectId, 'admin')) {
            return sendResponse(res, 403, false, 'Admin permissions required to archive project');
        }

        const projectService = require('../services/project.service');
        const project = await projectService.archiveProject(projectId, userId);

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'project_archive',
            description: `Archived project: ${project.name}`,
            entity: { type: 'Project', id: projectId, name: project.name },
            metadata: { ipAddress: req.ip },
            severity: 'warning'
        });

        sendResponse(res, 200, true, 'Project archived successfully', {
            project
        });
    } catch (error) {
        logger.error('Archive project error:', error);
        sendResponse(res, 500, false, 'Server error archiving project');
    }
};

// Clone project
exports.cloneProject = async (req, res) => {
    try {
        const { id: projectId } = req.params;
        const { name: newProjectName, includeTeam = false } = req.body;
        const userId = req.user.id;

        // Check access to original project
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        if (!userRoles.hasProjectRole(projectId)) {
            return sendResponse(res, 403, false, 'Access denied to original project');
        }

        const projectService = require('../services/project.service');
        const newProject = await projectService.cloneProject(
            projectId, 
            userId, 
            newProjectName,
            includeTeam
        );

        // Add owner role for new project
        await userRoles.addProjectRole(newProject._id, 'owner');

        // Log activity
        await ActivityLog.logActivity({
            userId,
            action: 'project_create',
            description: `Cloned project: ${newProjectName}`,
            entity: { type: 'Project', id: newProject._id, name: newProjectName },
            relatedEntities: [{ type: 'Project', id: projectId, name: 'Original Project' }],
            metadata: { 
                includeTeam,
                ipAddress: req.ip 
            }
        });

        sendResponse(res, 201, true, 'Project cloned successfully', {
            project: newProject
        });
    } catch (error) {
        logger.error('Clone project error:', error);
        sendResponse(res, 500, false, 'Server error cloning project');
    }
};