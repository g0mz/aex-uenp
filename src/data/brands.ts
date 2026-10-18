import type { Brand } from './types';
import { siDaf, siFord, siIveco, siScania, siVolkswagen, siVolvo } from 'simple-icons';

export const brands: Brand[] = [
  { name: 'Scania', svgPath: siScania.path },
  { name: 'Volkswagen', svgPath: siVolkswagen.path },
  { name: 'Iveco', svgPath: siIveco.path },
  { name: 'Mercedes-Benz', customIcon: 'mercedes-star' },
  { name: 'DAF', svgPath: siDaf.path },
  { name: 'Ford', svgPath: siFord.path },
  { name: 'Volvo', svgPath: siVolvo.path },
];
