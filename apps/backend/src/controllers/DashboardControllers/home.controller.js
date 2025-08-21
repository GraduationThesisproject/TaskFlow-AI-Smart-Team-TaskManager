const Task = require('../../models/Task');
const Workspace = require('../../models/Workspace');
const Notification = require('../../models/Notification');
const { sendResponse } = require('../../utils/response');

/**
 * @desc    Get dashboard home data
 * @route   GET /api/dashboard/home
 * @access  Private
 */


const getDashboardOverviewHome = async (req, res) => {
    try {
        // const userId = req.user?._id
           const userId = "68a5fc088a7b1bd27300b1b5"
        // const userId = user

        // Get workspaces
        const workspaces = await Workspace.find({ 'members.user': userId })
            .populate('members.user', 'name email')
            .limit(5);

        // Get high priority tasks
        const highPriorityTasks = await Task.find({
            'assignees': userId,
            'priority': 'high',
            'status': { $ne: 'completed' },
            'dueDate': { $gte: new Date() }
        })
            .sort({ dueDate: 1 })
            .limit(5)
            .lean();

        // Get overdue tasks
        const overdueTasks = await Task.find({
            'assignees': userId,
            'status': { $ne: 'completed' },
            'dueDate': { $lt: new Date() }
        })
            .sort({ dueDate: 1 })
            .limit(5)
            .lean();

        // Get recent notifications
        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // Format response
        const dashboardData = {
            workspaces: workspaces.map(ws => ({
                _id: ws._id,
                name: ws.name,
                description: ws.description,
                membersCount: ws.members.length,
                icon: ws.icon || 'briefcase',
                iconBgClass: ws.iconBgClass || 'bg-primary'
            })),
            tasks: {
                highPriority: highPriorityTasks,
                overdue: overdueTasks
            },
            notifications: notifications.map(notif => ({
                _id: notif._id,
                type: notif.type,
                message: notif.message,
                read: notif.read,
                createdAt: notif.createdAt,
                meta: notif.meta || {}
            }))
        };

        sendResponse(res, 200, true, 'Dashboard data retrieved successfully', dashboardData);
        
    } catch (error) {
        console.error('Dashboard error:', error);
        sendResponse(res, 500, false, 'Error fetching dashboard data');
    }
};

module.exports = {
    getDashboardOverviewHome
};