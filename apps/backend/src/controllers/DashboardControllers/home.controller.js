const { getTasks, getOverdueTasks } = require('../../task.controller');
const { getAllWorkspaces } = require('../../workspace.controller');
const { getNotifications } = require('../../notification.controller');
const { getRecentActivities } = require('../../activity.controller');
const { sendResponse } = require('../../utils/response');

/**
 * @desc    Get dashboard overview
 * @route   GET /api/dashboard/overview
 * @access  Private
 */

const getDashboardOverview = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Helper function to call controller methods
        const callController = async (controller, req, res) => {
            return new Promise((resolve) => {
                const customRes = {
                    json: (data) => resolve({ data, error: null }),
                    status: () => ({
                        json: (error) => resolve({ data: null, error })
                    })
                };
                controller(req, customRes, () => {});
            });
        };

        // Get workspaces
        const workspacesReq = { ...req, user: { id: userId } };
        const { data: workspacesData } = await callController(
            getAllWorkspaces, 
            workspacesReq, 
            {}
        );

        // Get tasks
        const tasksReq = { 
            ...req, 
            query: { 
                assignedToMe: 'true',
                limit: '10',
                sortBy: 'dueDate',
                sortOrder: 'asc',
                priority: 'high'
            } 
        };
        const { data: tasksData } = await callController(
            getTasks, 
            tasksReq, 
            {}
        );

        // Get overdue tasks
        const overdueReq = { 
            ...req, 
            query: { 
                assignedToMe: 'true',
                overdue: 'true',
                limit: '10'
            } 
        };
        const { data: overdueData } = await callController(
            getOverdueTasks, 
            overdueReq, 
            {}
        );

        // Get notifications
        const notifReq = { 
            ...req, 
            query: { 
                limit: '5',
                read: 'false'
            } 
        };
        const { data: notificationsData } = await callController(
            getNotifications, 
            notifReq, 
            {}
        );

        // Get recent activities
        const activitiesReq = { 
            ...req, 
            query: { 
                limit: '10'
            } 
        };
        const { data: activitiesData } = await callController(
            getRecentActivities, 
            activitiesReq, 
            {}
        );

        // Compile dashboard data
        const dashboardData = {
            workspaces: workspacesData?.workspaces || [],
            tasks: {
                highPriority: tasksData?.tasks || [],
                overdue: overdueData?.tasks || []
            },
            notifications: notificationsData?.notifications || [],
            activities: activitiesData?.activities || []
        };
        
        sendResponse(res, 200, true, 'Dashboard data retrieved successfully', dashboardData);
        
    } catch (error) {
        console.error('Dashboard error:', error);
        sendResponse(res, 500, false, 'Error fetching dashboard data');
    }
};

module.exports = {
    getDashboardOverview
};