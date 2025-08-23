const Workspace = require('../models/Workspace');
const ActivityLog = require('../models/ActivityLog');

class WorkspaceService {
  /**
   * Delete a workspace safely
   * @param {string} workspaceId 
   * @param {string} userId 
   * @returns {Promise<{message: string}>}
   */
  static async deleteWorkspace(workspaceId, userId) {
    try {
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        throw new Error('Workspace not found');
      }

      // Only owner can delete workspace
      if (workspace.owner.toString() !== userId) {
        throw new Error('Only workspace owner can delete this workspace');
      }

      // Optional: remove all members (except owner)
      workspace.members = [];
      workspace.usage.membersCount = 1;

      // Optional: remove spaces / reset usage counts
      workspace.spaces = [];
      workspace.usage.spacesCount = 0;
      workspace.usage.boardsCount = 0;
      workspace.usage.tasksCount = 0;
      workspace.usage.storageUsed = 0;

      // Save first to clear references
      await workspace.save();

      // Delete workspace
      await Workspace.deleteOne({ _id: workspaceId });

      // Log deletion
      await ActivityLog.logActivity({
        userId,
        action: 'workspace_delete',
        description: `Deleted workspace: ${workspace.name}`,
        entity: { type: 'Workspace', id: workspaceId, name: workspace.name },
        workspaceId,
        metadata: { ipAddress: 'manual cleanup' }
      });

      return { message: 'Workspace deleted successfully' };
    } catch (error) {
      console.error('Workspace deletion failed:', error);
      throw error;
    }
  }
}

module.exports = WorkspaceService;
