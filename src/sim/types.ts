export type PartType = 'silver' | 'bismuth' | 'generator' | 'solar' | 'lamp';

export type Tool = PartType | null;

export interface Part {
  id: number;
  type: PartType;
  col: number;
  row: number;
  temp: number;
  energy: number;
}

export interface Wire {
  id: number;
  from: number;
  to: number;
}

export interface World {
  hour: number;
  parts: Part[];
  wires: Wire[];
  nextId: number;
}
