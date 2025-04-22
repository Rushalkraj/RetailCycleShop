import { Cycle } from './cycle.model';
import { Order } from './order.model';

export interface InventoryHistory {
  historyId: number;
  cycleId: number;
  orderId?: number;
  previousQuantity: number;
  newQuantity: number;
  changeReason?: string;
  createdAt: Date;
  cycle?: Cycle;
  order?: Order;
}