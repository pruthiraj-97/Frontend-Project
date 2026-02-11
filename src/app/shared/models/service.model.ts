export interface Category {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  isActive: boolean;
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  startingPrice: number;
  basePrice: number;
  currency: string;
  typicalDurationMinutes: number;
  estimatedDuration: number;
  isActive: boolean;
  availableZones: string[];
  addons?: ServiceAddon[];
}

export interface ServiceAddon {
  id: string;
  name: string;
  description?: string;
  priceDelta: number;
  price: number;
  durationDeltaMinutes: number;
}

