export interface User {
  id: number;
  email: string;
  username: string | null;
  name: string;
  phone: string | null;
  address: string | null;
  role: "USER" | "ADMIN";
  isBlocked: boolean;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  createdAt: string;
  _count?: { products: number };
}

export interface ProductImage {
  id: number;
  productId: number;
  url: string;
  publicId: string;
  isMain: boolean;
}

export interface ProductVariant {
  id: number;
  productId: number;
  color: string | null;
  storage: string | null;
  ram: string | null;
  cpu: string | null;
  version: string | null;
  originalPrice: number;
  salePrice: number;
  stock: number;
  sold: number;
  imageUrl: string | null;
  imagePublicId: string | null;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  brand: string;
  categoryId: number;
  isActive: boolean;
  createdAt: string;
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  avgRating?: number;
  reviewCount?: number;
  minSalePrice?: number;
  maxSalePrice?: number;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  variantId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    slug: string;
    images?: { url: string }[];
  };
  variant: ProductVariant;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export interface Order {
  id: number;
  userId: number;
  code: string;
  status: OrderStatus;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string;
  isPaid: boolean;
  couponId: number | null;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: number; name: string; email: string };
  items: OrderItem[];
  coupon?: { code: string; discountType: string; discountValue: number };
}

export interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  content: string;
  createdAt: string;
  user: { id: number; name: string };
  product?: { id: number; name: string };
  likeCount: number;
  dislikeCount: number;
}

export interface Coupon {
  id: number;
  code: string;
  description: string | null;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  recentOrders: Order[];
}

export interface RevenueStats {
  year: number;
  onth: number | null;
  totalRevenue: number;
  orderCount: number;
  deliveredOrders: number;
  totalUsers: number;
  newUsers: number;
  chartData: { date: string; revenue: string }[];
  topProducts: {
    id: number;
    name: string;
    images: { url: string }[];
    totalSold: number;
  }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Banner {
  id: number;
  productId: number;
  imageUrl: string;
  publicId: string;
  isActive: boolean;
  product: { id: number; name: string; slug: string };
}

export type VariantForm = {
  id?: number;
  color: string;
  storage: string;
  ram: string;
  cpu: string;
  version: string;
  originalPrice: number | string;
  salePrice: number | string;
  stock: number | string;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  previewImageUrl?: string;
  imageFile?: File | null;
};
