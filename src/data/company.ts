import type { Company } from './types';

export const company: Company = {
  name: 'Mecânica Gaúcho Diesel',
  shortName: 'Gaúcho Diesel',
  city: 'Ourinhos',
  state: 'SP',
  address: 'Rod. Raposo Tavares, KM 377 + 700 m - Parque Valeriano Marcante, Ourinhos - SP, 19915-022',
  phoneDisplay: '(14) 98184-2627',
  phoneDigits: '5514981842627',
  email: 'gauchodiesel@hotmail.com',
  cnpj: '12.160.520/0001-40',
  legalName: 'F MOIA PEÇAS E SERVIÇOS LTDA',
  whatsappMessage: 'Olá, gostaria de pedir um serviço!',
  openingHours: 'Segunda a sexta, das 08:00 às 18:00',
  experienceYears: 18,
  socialLinks: [
    { label: 'Instagram', url: '', published: false },
    { label: 'Facebook', url: '', published: false },
    { label: 'Perfil da Empresa no Google', url: '', published: false },
  ],
};

export const whatsappUrl = `https://wa.me/${company.phoneDigits}?text=${encodeURIComponent(company.whatsappMessage)}`;
export const phoneUrl = `tel:+${company.phoneDigits}`;
export const emailUrl = `mailto:${company.email}`;
const mapsSearchQuery = `${company.name}, ${company.city} - ${company.state}`;
export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsSearchQuery)}`;
export const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapsSearchQuery)}&output=embed`;
