# Board Templates Feature

This document describes the implementation of the board templates feature for TaskFlow, which allows admins to create predefined board templates that users can choose from when creating new boards.

## Overview

The board templates feature provides:
- **Admin Panel**: Create, edit, and manage board templates with predefined lists and cards
- **User Experience**: Choose from templates when creating new boards
- **Flexibility**: Customizable lists, cards, priorities, and categories
- **Reusability**: Templates can be used multiple times and shared across the platform

## Architecture

### Backend Components

#### 1. BoardTemplate Model (`apps/backend/src/models/BoardTemplate.js`)
- **Schema**: Comprehensive template structure with lists, cards, metadata
- **Validation**: Ensures template integrity and proper structure
- **Methods**: Usage tracking, rating system, access control
- **Indexes**: Optimized for search and filtering

#### 2. BoardTemplate Controller (`apps/backend/src/controllers/boardTemplate.controller.js`)
- **CRUD Operations**: Full template management
- **Admin Endpoints**: Protected routes for template administration
- **Public Endpoints**: User-accessible template browsing
- **Validation**: Input validation and error handling

#### 3. BoardTemplate Routes (`apps/backend/src/routes/boardTemplate.routes.js`)
- **Admin Routes**: `/api/board-templates/admin/*` (protected)
- **Public Routes**: `/api/board-templates/*` (public)
- **Validation**: Middleware for request validation
- **Access Control**: Role-based permissions

### Frontend Components

#### 1. Admin Panel (`apps/admin/src/components/templates/`)
- **AdminTemplateManager**: Main template management interface
- **TemplateForm**: Create/edit template form with dynamic lists/cards
- **TemplatePreview**: Visual preview of template structure

#### 2. User Interface (`apps/main/src/components/templates/`)
- **TemplateSelector**: Modal for users to choose templates
- **Integration**: Seamless board creation flow

#### 3. State Management (`apps/admin/src/store/slices/boardTemplateSlice.ts`)
- **Redux Store**: Centralized template state
- **Async Actions**: API integration and error handling
- **UI State**: Modal management and form state

## Features

### Template Structure
- **Lists**: Ordered columns with customizable colors
- **Cards**: Pre-populated tasks with priorities, descriptions, and tags
- **Categories**: Multiple category support (Business, IT, Marketing, etc.)
- **Metadata**: Tags, ratings, usage statistics

### Admin Capabilities
- **Create Templates**: Build from scratch or use quick templates
- **Edit Templates**: Modify existing templates
- **Preview**: Visual representation of template structure
- **Status Management**: Activate/deactivate templates
- **Analytics**: Usage statistics and ratings

### User Experience
- **Template Selection**: Browse available templates by category
- **Search & Filter**: Find templates quickly
- **Visual Preview**: See template structure before selection
- **Quick Start**: Instant board setup with predefined structure

## Quick Templates

The system includes several pre-built templates:

1. **Marketing Plan**: Ideation → Planning → In Progress → Review → Completed
2. **Agile Sprint**: Backlog → Sprint Planning → In Progress → Testing → Done
3. **Bug Tracking**: New Issues → Investigating → In Progress → Testing Fix → Resolved
4. **Project Management**: To Do → Planning → In Progress → Review → Done

## API Endpoints

### Admin Endpoints (Protected)
```
GET    /api/board-templates/admin          # List all templates
GET    /api/board-templates/admin/stats    # Template statistics
POST   /api/board-templates                # Create template
PUT    /api/board-templates/:id            # Update template
DELETE /api/board-templates/:id            # Delete template
PATCH  /api/board-templates/:id/toggle-status  # Toggle active status
```

### Public Endpoints
```
GET    /api/board-templates                # List public templates
GET    /api/board-templates/:id            # Get template details
POST   /api/board-templates/:id/use        # Increment usage count
POST   /api/board-templates/:id/rate      # Rate template
```

## Usage Examples

### Creating a Template via API
```javascript
const templateData = {
  name: "Product Launch",
  description: "Template for managing product launch campaigns",
  categories: ["Marketing", "Business"],
  defaultLists: [
    { title: "Research", order: 0, color: "#3B82F6" },
    { title: "Planning", order: 1, color: "#10B981" },
    { title: "Execution", order: 2, color: "#F59E0B" },
    { title: "Launch", order: 3, color: "#8B5CF6" }
  ],
  defaultCards: [
    {
      title: "Market Analysis",
      description: "Conduct competitive analysis",
      listId: "Research",
      order: 0,
      priority: "high",
      estimatedHours: 8,
      tags: ["research", "analysis"]
    }
  ],
  tags: ["product", "launch", "campaign"],
  isPublic: true,
  isActive: true
};

const response = await fetch('/api/board-templates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify(templateData)
});
```

### Using a Template in Frontend
```typescript
import { TemplateSelector } from './components/templates/TemplateSelector';

const [showTemplateSelector, setShowTemplateSelector] = useState(false);

const handleTemplateSelect = (template: BoardTemplate) => {
  // Create board with template structure
  const boardData = {
    name: "My New Board",
    lists: template.defaultLists.map(list => ({
      title: list.title,
      color: list.color,
      order: list.order
    })),
    cards: template.defaultCards.map(card => ({
      title: card.title,
      description: card.description,
      listId: card.listId,
      priority: card.priority,
      estimatedHours: card.estimatedHours,
      tags: card.tags
    }))
  };
  
  // Create board and increment template usage
  createBoard(boardData);
  incrementTemplateUsage(template.id);
};

// In your JSX
<TemplateSelector
  isOpen={showTemplateSelector}
  onClose={() => setShowTemplateSelector(false)}
  onTemplateSelect={handleTemplateSelect}
/>
```

## Configuration

### Environment Variables
```bash
# Backend configuration
API_BASE_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3000

# Database (MongoDB)
MONGODB_URI=mongodb://localhost:27017/taskflow
```

### Database Indexes
The BoardTemplate model includes optimized indexes for:
- Text search (name, description)
- Category filtering
- Status filtering
- Usage statistics
- Rating sorting

## Security Considerations

### Access Control
- **Admin Routes**: Protected with JWT authentication and admin role verification
- **Public Routes**: Read-only access for template browsing
- **User Actions**: Rate and usage tracking require user authentication

### Data Validation
- **Input Validation**: Comprehensive validation of template structure
- **Schema Validation**: MongoDB schema validation for data integrity
- **XSS Protection**: Input sanitization and output encoding

## Performance Optimizations

### Backend
- **Database Indexes**: Optimized queries for common operations
- **Pagination**: Efficient template listing with pagination
- **Caching**: Template metadata caching for frequently accessed data

### Frontend
- **Lazy Loading**: Templates loaded on-demand
- **Virtual Scrolling**: Efficient rendering of large template lists
- **Debounced Search**: Optimized search input handling

## Testing

### Backend Tests
```bash
# Run template tests
npm test -- --grep "BoardTemplate"

# Run specific test file
npm test tests/controllers/boardTemplate.controller.test.js
```

### Frontend Tests
```bash
# Run component tests
npm test -- --grep "Template"

# Run specific test file
npm test src/components/templates/AdminTemplateManager.test.tsx
```

## Deployment

### Prerequisites
- Node.js 16+ and npm
- MongoDB 4.4+
- Redis (for caching, optional)

### Installation
```bash
# Backend
cd apps/backend
npm install
npm run build

# Frontend (Admin)
cd apps/admin
npm install
npm run build

# Frontend (Main App)
cd apps/main
npm install
npm run build
```

### Database Setup
```bash
# Create indexes
mongo taskflow --eval "db.boardtemplates.createIndex({name: 'text', description: 'text'})"
mongo taskflow --eval "db.boardtemplates.createIndex({categories: 1, isActive: 1})"
mongo taskflow --eval "db.boardtemplates.createIndex({usageCount: -1})"
```

## Troubleshooting

### Common Issues

1. **Template Creation Fails**
   - Check admin authentication
   - Verify template structure validation
   - Ensure required fields are provided

2. **Templates Not Loading**
   - Check API endpoint configuration
   - Verify CORS settings
   - Check database connectivity

3. **Performance Issues**
   - Verify database indexes are created
   - Check API response times
   - Monitor memory usage

### Debug Mode
Enable debug logging in backend:
```javascript
// config/env.js
DEBUG=true
LOG_LEVEL=debug
```

## Contributing

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation
4. Submit pull request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Jest**: Unit testing framework

## Future Enhancements

### Planned Features
- **Template Versioning**: Track template changes over time
- **Template Sharing**: Import/export templates between instances
- **Advanced Analytics**: Detailed usage patterns and insights
- **Template Marketplace**: Community-contributed templates
- **AI-Powered Templates**: Smart template suggestions

### API Extensions
- **Bulk Operations**: Batch template management
- **Webhooks**: Template usage notifications
- **Rate Limiting**: API usage controls
- **GraphQL**: Alternative query interface

## Support

For technical support or feature requests:
- **Issues**: GitHub repository issues
- **Documentation**: API documentation and guides
- **Community**: Developer forum and discussions

---

**Note**: This feature is designed to be extensible and maintainable. Follow the established patterns when adding new functionality or modifying existing code.
