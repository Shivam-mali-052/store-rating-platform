export interface DbUser {
  id: number;
  uid: string;
  email: string;
  name: string;
  address: string;
  role: "admin" | "user" | "store_owner";
  createdAt: string;
  averageRating?: number;
}

export interface StoreForUser {
  id: number;
  name: string;
  address: string;
  email: string;
  overallRating: number;
  userRating: number;
}

export interface StoreOwnerDashboardData {
  storeName: string;
  storeAddress: string;
  averageRating: number;
  ratingsList: Array<{
    id: number;
    userName: string;
    userEmail: string;
    userAddress: string;
    rating: number;
    date: string;
  }>;
}

export interface AdminStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}
