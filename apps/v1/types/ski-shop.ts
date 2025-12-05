export interface SkiShop {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website_url: string | null;
  shop_type: ShopType[];
  services: ShopService[];
  verified: boolean;
  is_active: boolean;
}

export type ShopType = 'rental' | 'retail' | 'repair' | 'demo';

export type ShopService =
  | 'ski_rental'
  | 'snowboard_rental'
  | 'boot_fitting'
  | 'tuning'
  | 'waxing'
  | 'repairs'
  | 'lessons';

export interface ResortSkiShop extends SkiShop {
  distance_miles: number;
  is_on_mountain: boolean;
  proximity_label: string;
}
