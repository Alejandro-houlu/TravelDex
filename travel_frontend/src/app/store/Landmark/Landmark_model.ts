export interface Reference {
  id: number;
  url: string;
  title: string;
  source: string;
  added_at: string;
  image_url: string | null;
}

export interface LandmarkDetails {
  id: number;
  tag: string;
  name: string;
  latitude: string;
  longitude: string;
  description: string | null;
  category: string | null;
  city: string | null;
  country: string | null;
  year_built: number | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  references: Reference[];
}