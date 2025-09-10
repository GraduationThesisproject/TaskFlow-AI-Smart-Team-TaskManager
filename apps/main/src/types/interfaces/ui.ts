import type { ReactNode, CSSProperties, SVGProps } from 'react';

// UI component interfaces used across the application

// Base UI interfaces
export interface BaseUIProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  style?: CSSProperties;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  disabled?: boolean;
  hidden?: boolean;
}

export interface BaseInputProps extends BaseUIProps {
  name: string;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  label?: string;
  helpText?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Button interfaces
export interface ButtonProps extends BaseUIProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  form?: string;
}

export interface IconButtonProps extends BaseUIProps {
  icon: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

// Input interfaces
export interface TextInputProps extends BaseInputProps {
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
}

export interface TextareaProps extends BaseInputProps {
  rows?: number;
  maxLength?: number;
  minLength?: number;
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

export interface SelectProps extends BaseInputProps {
  options: SelectOption[];
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  placeholder?: string;
  noOptionsMessage?: string;
  loading?: boolean;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
  description?: string;
}

export interface CheckboxProps extends BaseInputProps {
  checked: boolean;
  indeterminate?: boolean;
  label?: string;
  description?: string;
}

export interface RadioProps extends BaseInputProps {
  checked: boolean;
  value: string | number;
  label?: string;
  description?: string;
}

export interface SwitchProps extends BaseInputProps {
  checked: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Form interfaces
export interface FormProps extends BaseUIProps {
  onSubmit: (data: any) => void;
  onReset?: () => void;
  initialValues?: any;
  validationSchema?: any;
  loading?: boolean;
}

export interface FormFieldProps extends BaseUIProps {
  name: string;
  label?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormSectionProps extends BaseUIProps {
  title?: string;
  description?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

// Modal interfaces
export interface ModalProps extends BaseUIProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  preventScroll?: boolean;
}

export interface ModalHeaderProps extends BaseUIProps {
  title?: string;
  subtitle?: string;
  avatar?: ReactNode;
  action?: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface ModalBodyProps extends BaseUIProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface ModalFooterProps extends BaseUIProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

// Card interfaces
export interface CardProps extends BaseUIProps {
  variant?: 'default' | 'outline' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
  interactive?: boolean;
}

export interface CardHeaderProps extends BaseUIProps {
  title?: string;
  subtitle?: string;
  avatar?: ReactNode;
  action?: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface CardBodyProps extends BaseUIProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface CardFooterProps extends BaseUIProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

// Table interfaces
export interface TableProps<T = any> extends BaseUIProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: TablePagination;
  sortable?: boolean;
  selectable?: boolean;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
}

export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex: keyof T;
  render?: (value: any, record: T, index: number) => ReactNode;
  width?: number | string;
  minWidth?: number | string;
  sortable?: boolean;
  fixed?: 'left' | 'right';
  ellipsis?: boolean;
}

export interface TablePagination {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => string;
}

export interface TableRowProps<T = any> extends BaseUIProps {
  data: T;
  index: number;
  selected?: boolean;
  onClick?: () => void;
  onSelect?: (selected: boolean) => void;
}

// Navigation interfaces
export interface NavigationProps extends BaseUIProps {
  items: NavigationItem[];
  activeKey?: string;
  mode?: 'horizontal' | 'vertical';
  onItemClick?: (key: string) => void;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export interface NavigationItem {
  key: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  disabled?: boolean;
  children?: NavigationItem[];
}

export interface BreadcrumbProps extends BaseUIProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  maxItems?: number;
  showHome?: boolean;
}

export interface BreadcrumbItem {
  key: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  onClick?: () => void;
}

// Layout interfaces
export interface LayoutProps extends BaseUIProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  sidebarCollapsed?: boolean;
  sidebarWidth?: number;
  onSidebarToggle?: (collapsed: boolean) => void;
}

export interface HeaderProps extends BaseUIProps {
  title?: string;
  subtitle?: string;
  logo?: ReactNode;
  navigation?: ReactNode;
  actions?: ReactNode;
  userMenu?: ReactNode;
  fixed?: boolean;
  elevated?: boolean;
}

export interface SidebarProps extends BaseUIProps {
  collapsed?: boolean;
  collapsedWidth?: number;
  onCollapse?: (collapsed: boolean) => void;
  header?: ReactNode;
  footer?: ReactNode;
  fixed?: boolean;
  elevated?: boolean;
}

// Component interfaces
export interface BadgeProps extends BaseUIProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export interface AvatarProps extends BaseUIProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  fallback?: ReactNode;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

export interface TooltipProps extends BaseUIProps {
  content: string | ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
}

export interface PopoverProps extends BaseUIProps {
  content: ReactNode;
  trigger: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  triggerType?: 'hover' | 'click' | 'focus';
  offset?: number;
}

export interface AlertProps extends BaseUIProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  description?: string;
  icon?: ReactNode;
  closable?: boolean;
  onClose?: () => void;
  action?: ReactNode;
}

export interface ToastProps extends BaseUIProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  description?: string;
  icon?: ReactNode;
  duration?: number;
  onClose?: () => void;
  action?: ReactNode;
}

export interface ProgressProps extends BaseUIProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  animated?: boolean;
}

export interface SkeletonProps extends BaseUIProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: number | string;
  height?: number | string;
  animation?: 'pulse' | 'wave';
}

export interface OverlayProps extends BaseUIProps {
  visible: boolean;
  zIndex?: number;
  backdrop?: boolean;
  onBackdropClick?: () => void;
}

export interface DrawerProps extends BaseUIProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  preventScroll?: boolean;
  position?: 'left' | 'right' | 'top' | 'bottom';
}

export interface DropdownProps extends BaseUIProps {
  trigger: ReactNode;
  items: DropdownItem[];
  position?: 'top' | 'bottom' | 'left' | 'right';
  triggerType?: 'hover' | 'click' | 'focus';
  offset?: number;
}

export interface DropdownItem {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

// Utility interfaces
export interface PortalProps extends BaseUIProps {
  container?: Element;
}

export interface FocusTrapProps extends BaseUIProps {
  active?: boolean;
  returnFocus?: boolean;
}

export interface ClickOutsideProps extends BaseUIProps {
  onClickOutside: () => void;
  children?: ReactNode;
}

// Drag and Drop interfaces
export interface DraggableProps extends BaseUIProps {
  draggable?: boolean;
  onDragStart?: (e: any) => void;
  onDragOver?: (e: any) => void;
  onDragEnd?: (e: any) => void;
  onDrop?: (e: any) => void;
  children?: ReactNode;
}

export interface DroppableProps extends BaseUIProps {
  droppable?: boolean;
  onDragOver?: (e: any) => void;
  onDragEnter?: (e: any) => void;
  onDragLeave?: (e: any) => void;
  onDrop?: (e: any) => void;
  children?: ReactNode;
}

// Permission and Guard interfaces
export interface WithPermissionsProps extends BaseUIProps {
  permissions: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export interface PermissionGuardProps extends BaseUIProps {
  permissions: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

// Component-specific interfaces
export interface AddTaskModalProps extends BaseUIProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: any) => void;
  selectedColumn?: string;
  columns?: any[];
  boardId?: string;
  spaceId?: string;
  workspaceId?: string;
  currentUser?: any;
  initialData?: any;
}

export interface CommentItemProps extends BaseUIProps {
  comment: any;
  users: { _id: string; name: string; email?: string; avatar?: string }[];
  currentUserId: string;
  onCommentUpdate: (commentId: string, updated: any) => void;
  onCommentDelete: (commentId: string) => void;
  onReplyAdd: (commentId: string, content: string) => void;
}

export interface DraggableColumnProps extends BaseUIProps {
  column: any;
  tasks: any[];
  index: number;
  boardId: string;
  onTaskClick: (task: any) => void;
  onAddTask: (taskData: any) => Promise<void>;
  onEditColumn: (columnId: string) => void;
  onDeleteColumn: (columnId: string) => void;
}

export interface TaskDetailModalProps extends BaseUIProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: any) => void;
  onDelete?: (taskId: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface AddColumnModalProps extends BaseUIProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (column: any) => void;
  boardId?: string;
  spaceId?: string;
  workspaceId?: string;
}

export interface DraggableTaskProps extends BaseUIProps {
  task: any;
  index: number;
  columnId: string;
  onClick: (task: any) => void;
  onDragStart?: (e: any) => void;
  onDragEnd?: (e: any) => void;
  onDrop?: (e: any) => void;
  children?: ReactNode;
}

export interface SubNavigationProps extends BaseUIProps {
  items: NavigationItem[];
  activeKey?: string;
  onItemClick?: (key: string) => void;
}

export interface EditColumnModalProps extends BaseUIProps {
  column: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (columnId: string, data: any) => void;
}

export interface BoardDeletionSettingsModalProps extends BaseUIProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  workspaceId: string;
}

export interface ConfirmRemoveMemberDialogProps extends BaseUIProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  member: any;
  workspaceId: string;
}

export interface CreateSpaceModalProps extends BaseUIProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (space: any) => void;
  workspaceId: string;
}

export interface VisibilitySettingsModalProps extends BaseUIProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
  currentSettings: any;
}

export interface BoardCreationSettingsModalProps extends BaseUIProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
  currentSettings: any;
}

export interface CreateBoardModalProps extends BaseUIProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (board: any) => void;
  spaceId: string;
  workspaceId: string;
}

export interface BoardCardProps extends BaseUIProps {
  board: any;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface SpaceHeaderProps extends BaseUIProps {
  space: any;
  workspace: any;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface ThemeToggleProps extends BaseUIProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

export interface InfoBannerProps extends BaseUIProps {
  title: string;
  description?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  action?: ReactNode;
  onClose?: () => void;
}

export interface InviteSectionProps extends BaseUIProps {
  workspaceId: string;
  onInvite?: (email: string, role: string) => void;
  canInvite?: boolean;
}

export interface PeopleIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export interface SettingsSection {
  key: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  component?: ReactNode;
  disabled?: boolean;
}

export interface SettingsListProps extends BaseUIProps {
  sections: SettingsSection[];
  activeSection?: string;
  onSectionChange?: (key: string) => void;
}

export interface SearchAndFilterProps extends BaseUIProps {
  onSearch?: (query: string) => void;
  onFilter?: (filters: any) => void;
  placeholder?: string;
  filters?: any[];
}

export interface ClockIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export interface SocketStatusIndicatorProps extends BaseUIProps {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  showText?: boolean;
}

export interface CheckSquareIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export interface SettingsCardProps extends BaseUIProps {
  title: string;
  description?: string;
  sections: SettingsSection[];
  onSave?: (data: any) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export interface BellIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export interface SettingsHeaderProps extends BaseUIProps {
  children: ReactNode;
  title: string;
  description?: string;
  backButton?: boolean;
  onBack?: () => void;
}

export interface CalendarIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export interface LogoutConfirmDialogProps extends BaseUIProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (allDevices?: boolean) => void;
  userName?: string;
}

export interface AppLayoutProps extends BaseUIProps {
  children: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
}

export interface PublicRouteProps extends BaseUIProps {
  children: ReactNode;
}

export interface LazyComponentProps extends BaseUIProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorBoundary?: boolean;
}

export interface ErrorBoundaryProps extends BaseUIProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export interface LazyImageProps extends BaseUIProps {
  src: string;
  alt: string;
  fallback?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export interface OptimizedListProps<T> extends BaseUIProps {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string;
  loading?: boolean;
  emptyMessage?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export interface AccessibilityContextType {
  isReducedMotion: boolean;
  isHighContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setReducedMotion: (reduced: boolean) => void;
  setHighContrast: (high: boolean) => void;
}

export interface AccessibilityProviderProps extends BaseUIProps {
  children: ReactNode;
}

export interface GuestSharingSettingsModalProps extends BaseUIProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
  currentSettings: any;
}

export interface NavigationGuardProps extends BaseUIProps {
  children: ReactNode;
  onBeforeNavigate?: () => boolean | Promise<boolean>;
  onNavigate?: () => void;
}

export interface ProtectedLinkProps extends BaseUIProps {
  to: string;
  children: ReactNode;
  permissions?: string[];
  fallback?: ReactNode;
}

export interface ProtectedRouteProps extends BaseUIProps {
  children: ReactNode;
  permissions?: string[];
  fallback?: ReactNode;
  redirectTo?: string;
}

export interface AuthButtonsProps extends BaseUIProps {
  onLogin?: () => void;
  onRegister?: () => void;
  variant?: 'default' | 'outline';
}

export interface ChatWidgetProps extends BaseUIProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage?: (message: string) => void;
  messages?: any[];
  currentUser?: any;
}

export interface LogoProps extends BaseUIProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white' | 'dark';
}

export interface DashboardActionsProps extends BaseUIProps {
  onCreateWorkspace?: () => void;
  onJoinWorkspace?: () => void;
  onCreateSpace?: () => void;
  onCreateBoard?: () => void;
}

export interface MenuButtonProps extends BaseUIProps {
  isOpen: boolean;
  onToggle: () => void;
  variant?: 'default' | 'hamburger';
}

export interface MobileMenuProps extends BaseUIProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavigationItem[];
  activeKey?: string;
  onItemClick?: (key: string) => void;
}

export interface NavigationLinksProps extends BaseUIProps {
  children?: ReactNode;
  items: NavigationItem[];
  activeKey?: string;
  onItemClick?: (key: string) => void;
  variant?: 'default' | 'vertical';
}

export interface UserProfileProps extends BaseUIProps {
  user: any;
  onEdit?: () => void;
  onLogout?: () => void;
  variant?: 'default' | 'compact';
}

export interface NotificationButtonProps extends BaseUIProps {
  count?: number;
  onToggle?: () => void;
  isOpen?: boolean;
}

export interface ThemeToggleButtonProps extends BaseUIProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  variant?: 'default' | 'icon';
}

export interface WelcomeHeaderProps extends BaseUIProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export interface DeleteWorkspaceModalProps extends BaseUIProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName?: string;
}

export interface CreateWorkspaceModalProps extends BaseUIProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (workspace: any) => void;
}

export interface TemplatesFiltersProps extends BaseUIProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  onReset?: () => void;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  joinedAt: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface MembersTableProps extends BaseUIProps {
  members: Member[];
  onEditMember?: (member: Member) => void;
  onRemoveMember?: (memberId: string) => void;
  canEdit?: boolean;
  canRemove?: boolean;
}

export interface SpaceTableProps extends BaseUIProps {
  spaces: any[];
  onSpaceClick?: (space: any) => void;
  onEditSpace?: (space: any) => void;
  onDeleteSpace?: (space: any) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}
