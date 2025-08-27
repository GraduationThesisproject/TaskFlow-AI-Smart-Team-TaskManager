const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'TaskFlow Test Server Running',
    timestamp: new Date().toISOString()
  });
});

// Mock template endpoints for testing
app.get('/api/templates/public', (req, res) => {
  const mockTemplates = [
    {
      _id: '1',
      name: 'Software Development Sprint',
      description: 'Complete agile workflow template for software development teams',
      type: 'kanban',
      category: 'Development',
      usageCount: 15,
      columns: [
        { name: 'To Do', position: 0, color: '#6B7280' },
        { name: 'In Progress', position: 1, color: '#3B82F6' },
        { name: 'Review', position: 2, color: '#F59E0B' },
        { name: 'Done', position: 3, color: '#10B981' }
      ],
      cards: [
        {
          title: 'Setup Project Environment',
          description: 'Initialize development environment and install dependencies',
          priority: 'high',
          estimatedHours: 4,
          tags: ['setup', 'development'],
          position: 0
        },
        {
          title: 'Create Database Schema',
          description: 'Design and implement database structure',
          priority: 'high',
          estimatedHours: 6,
          tags: ['database', 'schema'],
          position: 1
        }
      ]
    },
    {
      _id: '2',
      name: 'Marketing Campaign',
      description: 'End-to-end marketing campaign management template',
      type: 'timeline',
      category: 'Marketing',
      usageCount: 8,
      columns: [
        { name: 'Planning', position: 0, color: '#8B5CF6' },
        { name: 'Execution', position: 1, color: '#3B82F6' },
        { name: 'Review', position: 2, color: '#F59E0B' },
        { name: 'Launch', position: 3, color: '#10B981' }
      ],
      cards: [
        {
          title: 'Define Target Audience',
          description: 'Research and identify target market segments',
          priority: 'high',
          estimatedHours: 8,
          tags: ['research', 'audience'],
          position: 0
        }
      ]
    }
  ];

  res.json({
    success: true,
    message: 'Templates retrieved successfully',
    data: {
      templates: mockTemplates
    }
  });
});

app.get('/api/templates/categories', (req, res) => {
  const categories = [
    { name: 'Development', count: 5 },
    { name: 'Design', count: 3 },
    { name: 'Marketing', count: 4 },
    { name: 'Sales', count: 2 },
    { name: 'Support', count: 3 },
    { name: 'Operations', count: 2 },
    { name: 'HR', count: 1 },
    { name: 'Finance', count: 1 },
    { name: 'General', count: 2 },
    { name: 'Custom', count: 0 }
  ];

  res.json({
    success: true,
    message: 'Categories retrieved successfully',
    data: { categories }
  });
});

// Mock admin template endpoints
app.get('/api/templates/admin', (req, res) => {
  const mockTemplates = [
    {
      _id: '1',
      name: 'Software Development Sprint',
      description: 'Complete agile workflow template for software development teams',
      type: 'kanban',
      category: 'Development',
      isActive: true,
      isPublic: true,
      usageCount: 15,
      lastUsed: '2025-08-25T10:00:00Z',
      tags: ['agile', 'development', 'sprint'],
      columns: [
        { name: 'To Do', position: 0, color: '#6B7280', isDefault: true },
        { name: 'In Progress', position: 1, color: '#3B82F6', isDefault: true },
        { name: 'Review', position: 2, color: '#F59E0B', isDefault: true },
        { name: 'Done', position: 3, color: '#10B981', isDefault: true }
      ],
      cards: [
        {
          title: 'Setup Project Environment',
          description: 'Initialize development environment and install dependencies',
          priority: 'high',
          estimatedHours: 4,
          tags: ['setup', 'development'],
          position: 0
        }
      ],
      createdBy: {
        _id: 'admin1',
        name: 'Admin User',
        email: 'admin@taskflow.com'
      },
      createdAt: '2025-08-20T10:00:00Z',
      updatedAt: '2025-08-25T10:00:00Z'
    }
  ];

  res.json({
    success: true,
    message: 'Templates retrieved successfully',
    data: {
      templates: mockTemplates,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
        itemsPerPage: 20
      }
    }
  });
});

app.get('/api/templates/admin/stats/overview', (req, res) => {
  res.json({
    success: true,
    message: 'Template statistics retrieved successfully',
    data: {
      totalTemplates: 12,
      totalUsage: 156,
      avgUsage: 13,
      mostUsed: 25
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TaskFlow Test Server running on port ${PORT}`);
  console.log(`📊 Environment: test`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Template API: http://localhost:${PORT}/api/templates/public`);
  console.log(`👑 Admin API: http://localhost:${PORT}/api/templates/admin`);
});

module.exports = app;
