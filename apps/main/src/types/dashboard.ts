export interface WorkspaceCardProps {
  title: string;
  description: string;
  memberCount: number;
  projectCount: number;
}


export interface UpgradeCardProps {
  title: string;
  description: string;
  buttonText?: string;
}

export interface NotificationCardProps {
  title: string;
  description: string;
  time?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  accentClassName?: string;
}

export interface EventCardProps {
    month: string;
    day: number | string;
    title: string;
    meta: string;
  }
  
export interface ActivityItemProps {
  avatarUrl: string;
  actorName: string;
  action: string;
  highlight: string;
  meta: string;
}