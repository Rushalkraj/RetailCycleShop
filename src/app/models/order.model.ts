// export interface Order {
//   orderId: number;
//   orderNumber: string;
//   customer: Customer;
//   orderDate: string;
//   status: number;
//   subtotal: number;
//   tax: number;
//   totalAmount: number;
//   orderItems?: OrderItem[];  
//   shippingAddress?: Address;
// }
// order.model.ts
import { Payment } from './payment.model';
import { Address, Customer } from './customer.model';
// import { Address } from './address.model';
// import { OrderItem } from './order-item.model';

export interface Order {
  orderId: number;
  orderNumber: string;
  customerId: number;
  orderDate: string;
  status: number;
  subtotal: number;
  tax: number;
  discount: number;
  shippingAddressId: number;
  totalAmount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  paymentId?: number;
  employeeId?: number;

  customer: Customer;
  shippingAddress: Address;
  orderItems: OrderItem[];
  payment?: Payment; // Added this
}


export interface OrderItem {
  orderItemId?: number;
  orderId?: number;
  cycleId: number;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  totalPrice?: number;
  createdAt?: string;
  cycle?: {
    brand?: string;
    model?: string;
  };
}


export interface OrderCreateDto {
  customerId: number;
  shippingAddressId: number;
  subtotal: number;
  tax: number;
  totalAmount: number;
  paymentMethod: string;
  items: OrderItem[];
  employeeId?: number;
}
// export interface Customer {
//   customerId: number;
//   firstName: string;
//   lastName: string;
// }
// export interface Address {
//   addressId: number;
//   streetLine1: string;

// }
export enum OrderStatus {
  Pending = 1,
  Processing = 2,
  Completed = 3,
  Cancelled = 4
}