// lib/types/product.ts
// (or wherever you keep shared types, e.g. src/types/product.ts)

export interface Price {
  day: number;
  week: number;
}

export interface FeatureSection {
  title: string;
  items: string[];
}

export interface FeaturesData {
  [category: string]: FeatureSection[];
}

export interface Product {
  _id?: string;
  slug: string;
  name: string;
  desc: string;
  image: string;
  version: string;
  size: string;
  updated: string;
  category: string;
  type?: string;                    // e.g. "mods" or "games"
  prices: Price;
  downloadLink?: string;
  statusEnabled?: boolean;
  statusLabel?: string;
  featuresEnabled?: boolean;
  featuresData?: FeaturesData;
}