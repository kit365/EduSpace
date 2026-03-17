/** Point Earning Rule - matches BE PointEarningRuleResponse */
export interface PointEarningRule {
  id: number;
  actionName: string;
  pointsEarned: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PointEarningRuleRequest {
  actionName: string;
  pointsEarned: number;
  description?: string;
  isActive?: boolean;
}

/** Reward Catalog - matches BE RewardCatalogResponse */
export interface RewardCatalog {
  id: number;
  name: string;
  description?: string;
  pointsRequired: number;
  stock: number;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RewardCatalogRequest {
  name: string;
  description?: string;
  pointsRequired: number;
  stock: number;
  isActive?: boolean;
  imageUrl?: string;
}

/** Loyalty conversion config - 1 point = X VND */
export interface LoyaltyConfig {
  id: number;
  vndPerPoint: number;
  updatedAt: string;
}

export interface LoyaltyConfigRequest {
  vndPerPoint: number;
}

/** Point Transaction - matches BE PointTransactionResponse */
export type TransactionType = 'EARN' | 'REDEEM';

export interface PointTransaction {
  id: number;
  userId: string;
  userFullName?: string;
  bookingId?: string;
  points: number;
  transactionType: TransactionType;
  reason?: string;
  createdAt: string;
}
