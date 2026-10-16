import { PartType } from './types';

export interface PartInfo {
  type: PartType;
  name: string;
  icon: string;
  color: string;
  buried: boolean;
  desc: string;
}

export const PART_LIST: PartInfo[] = [
  { type: 'silver', name: '은', icon: 'Ag', color: '#d9dce3', buried: true, desc: '열을 잘 흡수해 뜨거워집니다' },
  { type: 'bismuth', name: '비스무트', icon: 'Bi', color: '#c08ae0', buried: true, desc: '열이 잘 오르지 않습니다' },
  { type: 'generator', name: '발전기', icon: '🔋', color: '#e0a03a', buried: false, desc: '전기를 모아 저장합니다' },
  { type: 'solar', name: '태양열', icon: '☀️', color: '#3a6fd1', buried: false, desc: '햇빛으로 전기를 만듭니다' },
  { type: 'lamp', name: '가로등', icon: '💡', color: '#6b6b6b', buried: false, desc: '전기가 있으면 켜집니다' },
];

export function getInfo(type: PartType): PartInfo {
  return PART_LIST.find((info) => info.type === type)!;
}

export function isMetal(type: PartType): boolean {
  return type === 'silver' || type === 'bismuth';
}
