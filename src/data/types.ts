export interface SocialLink {
  label: string;
  url: string;
  published: boolean;
}

export interface Company {
  name: string;
  shortName: string;
  city: string;
  state: string;
  address: string;
  phoneDisplay: string;
  phoneDigits: string;
  email: string;
  cnpj: string;
  legalName: string;
  whatsappMessage: string;
  openingHours: string;
  experienceYears: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  socialLinks: SocialLink[];
}

export interface Service {
  title: string;
  description: string;
}

export interface Brand {
  name: string;
  svgPath?: string;
  customIcon?: 'mercedes-star';
}

export interface Client {
  name: string;
  logo?: string;
  description?: string;
  featured?: boolean;
  published: boolean;
}

export interface PortfolioItem {
  title: string;
  description: string;
  image: string;
  alt: string;
  published: boolean;
}
