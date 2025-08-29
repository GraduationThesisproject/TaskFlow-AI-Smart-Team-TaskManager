export interface BoardTemplateList {
  id: string;
  title: string;
  order: number;
  color: string;
}

export interface BoardTemplateCard {
  id?: string;
  title: string;
  description?: string;
  listId: string;
  order: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours: number;
  tags: string[];
}

export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  categories: string[];
  defaultLists: BoardTemplateList[];
  defaultCards: BoardTemplateCard[];
  thumbnail?: string;
  isActive: boolean;
  isPublic: boolean;
  usageCount: number;
  rating: {
    average: number;
    count: number;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardTemplateRequest {
  name: string;
  description: string;
  categories: string[];
  defaultLists: BoardTemplateList[];
  defaultCards?: BoardTemplateCard[];
  tags?: string[];
  isPublic?: boolean;
  isActive?: boolean;
}

export interface UpdateBoardTemplateRequest extends Partial<CreateBoardTemplateRequest> {
  id: string;
}

export interface BoardTemplateFilters {
  search?: string;
  categories?: string[];
  status?: 'active' | 'inactive';
  page?: number;
  limit?: number;
}

export interface BoardTemplateStats {
  totalTemplates: number;
  activeTemplates: number;
  publicTemplates: number;
  totalUsage: number;
  avgRating: number;
}

export interface BoardTemplateResponse {
  success: boolean;
  data: BoardTemplate;
  message?: string;
}

export interface BoardTemplateListResponse {
  success: boolean;
  data: {
    templates: BoardTemplate[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface BoardTemplateStatsResponse {
  success: boolean;
  data: BoardTemplateStats;
}

// Predefined template categories
export const TEMPLATE_CATEGORIES = [
  'Business',
  'IT',
  'Personal',
  'Marketing',
  'Development',
  'Design',
  'Sales',
  'Support',
  'Operations',
  'HR',
  'Finance',
  'General',
  'Custom'
] as const;

// Predefined list colors
export const LIST_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280'  // Gray
] as const;

// Priority options
export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: '#10B981' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'high', label: 'High', color: '#EF4444' },
  { value: 'urgent', label: 'Urgent', color: '#DC2626' }
] as const;

// Default templates for quick creation
export const DEFAULT_TEMPLATES: Partial<CreateBoardTemplateRequest>[] = [
  {
    name: 'Marketing Plan',
    description: 'A comprehensive marketing plan template with stages from ideation to execution',
    categories: ['Marketing', 'Business'],
    defaultLists: [
      { title: 'Ideas & Research', order: 0, color: '#3B82F6' },
      { title: 'Planning', order: 1, color: '#10B981' },
      { title: 'In Progress', order: 2, color: '#F59E0B' },
      { title: 'Review', order: 3, color: '#8B5CF6' },
      { title: 'Completed', order: 4, color: '#10B981' }
    ],
    defaultCards: [
      {
        title: 'Market Research',
        description: 'Conduct comprehensive market analysis',
        listId: 'Ideas & Research',
        order: 0,
        priority: 'high',
        estimatedHours: 8,
        tags: ['research', 'analysis']
      },
      {
        title: 'Campaign Strategy',
        description: 'Develop marketing campaign strategy',
        listId: 'Planning',
        order: 0,
        priority: 'high',
        estimatedHours: 12,
        tags: ['strategy', 'planning']
      }
    ]
  },
  {
    name: 'Agile Sprint',
    description: 'Standard agile sprint template for software development teams',
    categories: ['Development', 'IT'],
    defaultLists: [
      { title: 'Backlog', order: 0, color: '#6B7280' },
      { title: 'Sprint Planning', order: 1, color: '#3B82F6' },
      { title: 'In Progress', order: 2, color: '#F59E0B' },
      { title: 'Testing', order: 3, color: '#8B5CF6' },
      { title: 'Done', order: 4, color: '#10B981' }
    ],
    defaultCards: [
      {
        title: 'Sprint Planning Meeting',
        description: 'Plan tasks for the current sprint',
        listId: 'Sprint Planning',
        order: 0,
        priority: 'high',
        estimatedHours: 2,
        tags: ['planning', 'meeting']
      },
      {
        title: 'Code Review',
        description: 'Review code changes',
        listId: 'Testing',
        order: 0,
        priority: 'medium',
        estimatedHours: 4,
        tags: ['review', 'quality']
      }
    ]
  },
  {
    name: 'Bug Tracking',
    description: 'Bug tracking and issue management template',
    categories: ['IT', 'Support'],
    defaultLists: [
      { title: 'New Issues', order: 0, color: '#EF4444' },
      { title: 'Investigating', order: 1, color: '#F59E0B' },
      { title: 'In Progress', order: 2, color: '#3B82F6' },
      { title: 'Testing Fix', order: 3, color: '#8B5CF6' },
      { title: 'Resolved', order: 4, color: '#10B981' }
    ],
    defaultCards: [
      {
        title: 'Bug Report Template',
        description: 'Use this template for new bug reports',
        listId: 'New Issues',
        order: 0,
        priority: 'high',
        estimatedHours: 1,
        tags: ['template', 'documentation']
      },
      {
        title: 'Reproduction Steps',
        description: 'Document steps to reproduce the issue',
        listId: 'Investigating',
        order: 0,
        priority: 'medium',
        estimatedHours: 2,
        tags: ['documentation', 'investigation']
      }
    ]
  },
  {
    name: 'Project Management',
    description: 'General project management template for any type of project',
    categories: ['Business', 'General'],
    defaultLists: [
      { title: 'To Do', order: 0, color: '#6B7280' },
      { title: 'Planning', order: 1, color: '#3B82F6' },
      { title: 'In Progress', order: 2, color: '#F59E0B' },
      { title: 'Review', order: 3, color: '#8B5CF6' },
      { title: 'Done', order: 4, color: '#10B981' }
    ],
    defaultCards: [
      {
        title: 'Project Kickoff',
        description: 'Initial project planning and setup',
        listId: 'Planning',
        order: 0,
        priority: 'high',
        estimatedHours: 4,
        tags: ['planning', 'kickoff']
      },
      {
        title: 'Stakeholder Review',
        description: 'Review project progress with stakeholders',
        listId: 'Review',
        order: 0,
        priority: 'high',
        estimatedHours: 2,
        tags: ['review', 'stakeholders']
      }
    ]
  }
];
