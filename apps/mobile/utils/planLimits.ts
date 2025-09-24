/**
 * Utility functions for enforcing free plan limits
 */

// Free plan limits
export const FREE_PLAN_LIMITS = {
  MAX_SPACES_PER_WORKSPACE: 5,
  MAX_BOARDS_PER_SPACE: 10,
  MAX_MEMBERS_PER_WORKSPACE: 10,
  MAX_FILE_SIZE_MB: 10,
  MAX_COMMAND_RUNS_PER_MONTH: 250,
} as const;

// Standard plan limits
export const STANDARD_PLAN_LIMITS = {
  MAX_SPACES_PER_WORKSPACE: Infinity,
  MAX_BOARDS_PER_SPACE: Infinity,
  MAX_MEMBERS_PER_WORKSPACE: 25,
  MAX_FILE_SIZE_MB: 250,
  MAX_COMMAND_RUNS_PER_MONTH: 1000,
} as const;

// Premium plan limits (unlimited)
export const PREMIUM_PLAN_LIMITS = {
  MAX_SPACES_PER_WORKSPACE: Infinity,
  MAX_BOARDS_PER_SPACE: Infinity,
  MAX_MEMBERS_PER_WORKSPACE: Infinity,
  MAX_FILE_SIZE_MB: 250,
  MAX_COMMAND_RUNS_PER_MONTH: Infinity,
} as const;

// Enterprise plan limits (unlimited)
export const ENTERPRISE_PLAN_LIMITS = {
  MAX_SPACES_PER_WORKSPACE: Infinity,
  MAX_BOARDS_PER_SPACE: Infinity,
  MAX_MEMBERS_PER_WORKSPACE: Infinity,
  MAX_FILE_SIZE_MB: Infinity,
  MAX_COMMAND_RUNS_PER_MONTH: Infinity,
} as const;

/**
 * Get user's current plan limits
 */
export const getUserPlanLimits = (user: any) => {
  const plan = user?.subscription?.plan?.toLowerCase() || 'free';
  const isActiveSubscription = user?.subscription?.status === 'active';
  
  if (!isActiveSubscription) {
    return FREE_PLAN_LIMITS;
  }

  switch (plan) {
    case 'standard':
      return STANDARD_PLAN_LIMITS;
    case 'premium':
      return PREMIUM_PLAN_LIMITS;
    case 'enterprise':
      return ENTERPRISE_PLAN_LIMITS;
    default:
      return FREE_PLAN_LIMITS;
  }
};

/**
 * Check if user can create more spaces in a workspace
 */
export const canCreateSpace = (user: any, currentSpacesCount: number): boolean => {
  const limits = getUserPlanLimits(user);
  return currentSpacesCount < limits.MAX_SPACES_PER_WORKSPACE;
};

/**
 * Check if user can create more boards in a space
 */
export const canCreateBoard = (user: any, currentBoardsCount: number): boolean => {
  const limits = getUserPlanLimits(user);
  return currentBoardsCount < limits.MAX_BOARDS_PER_SPACE;
};

/**
 * Check if user can invite more members to a workspace
 */
export const canInviteMember = (user: any, currentMembersCount: number): boolean => {
  const limits = getUserPlanLimits(user);
  return currentMembersCount < limits.MAX_MEMBERS_PER_WORKSPACE;
};

/**
 * Get the upgrade message for a specific limit
 */
export const getUpgradeMessage = (limitType: keyof typeof FREE_PLAN_LIMITS): string => {
  const limit = FREE_PLAN_LIMITS[limitType];
  
  switch (limitType) {
    case 'MAX_SPACES_PER_WORKSPACE':
      return `You've reached your limit of ${limit} spaces per workspace. Upgrade to Premium for unlimited spaces.`;
    case 'MAX_BOARDS_PER_SPACE':
      return `You've reached your limit of ${limit} boards per space. Upgrade to Premium for unlimited boards.`;
    case 'MAX_MEMBERS_PER_WORKSPACE':
      return `You've reached your limit of ${limit} members per workspace. Upgrade to Premium for unlimited team members.`;
    case 'MAX_FILE_SIZE_MB':
      return `File size limit is ${limit}MB. Upgrade to Premium for larger file uploads (${PREMIUM_PLAN_LIMITS.MAX_FILE_SIZE_MB}MB).`;
    case 'MAX_COMMAND_RUNS_PER_MONTH':
      return `You've used your ${limit} monthly command runs. Upgrade to Premium for unlimited automation.`;
    default:
      return 'Upgrade to Premium for unlimited access to this feature.';
  }
};

/**
 * Get plan display name
 */
export const getPlanDisplayName = (plan: string): string => {
  switch (plan?.toLowerCase()) {
    case 'standard':
      return 'Standard';
    case 'premium':
      return 'Premium';
    case 'enterprise':
      return 'Enterprise';
    default:
      return 'Free';
  }
};

/**
 * Check if user has active premium subscription
 */
export const hasActivePremiumSubscription = (user: any): boolean => {
  const plan = user?.subscription?.plan?.toLowerCase();
  const isActive = user?.subscription?.status === 'active';
  return isActive && (plan === 'standard' || plan === 'premium' || plan === 'enterprise');
};

/**
 * Check if user is on free plan
 */
export const isFreePlan = (user: any): boolean => {
  const plan = user?.subscription?.plan?.toLowerCase() || 'free';
  const isActiveSubscription = user?.subscription?.status === 'active';
  
  return plan === 'free' || !isActiveSubscription;
};

/**
 * Check if user is on premium plan
 */
export const isPremiumPlan = (user: any): boolean => {
  return !isFreePlan(user);
};
