export interface Cycle {
  cycleId: number;
  brand: string;
  type: string;
  model: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  isLowStock?: boolean;
}
export type CycleCreate = Omit<Cycle, 'cycleId'>;
export type CycleUpdate = Omit<Cycle, 'cycleId'>;