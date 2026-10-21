export interface City {
  nameHe: string;
  nameEn: string;
}

export interface Weather {
  country: string;
  city: string;
  tempC: number;
  condition: string;
  windKph: number;
  icon: string;
}

export interface SearchRecord {
  time: string;
  city: string;
  country: string;
}
