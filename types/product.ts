export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price: number | null;
  stock: number;
  image_url: string;
  additional_images?: string[];
  specifications: ProductSpecifications;
  is_featured: boolean;
  created_at: string;
  categories?: Category;
  translations?: {
    [locale: string]: {
      name?: string;
      description?: string;
    }
  };
}

export interface ProductSpecifications {
  strength?: string;
  volume?: string;
  count?: string;
  ingredients?: string;
  usage?: string;
  [key: string]: string | undefined;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  translations?: {
    [locale: string]: {
      name?: string;
      description?: string;
    }
  };
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  users?: {
    full_name: string;
  };
}

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  cbdPercentage?: string[];
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
  search?: string;
}

export interface TranslatedSlug {
  en: string;
  nl: string;
  de: string;
  fr: string;
}
