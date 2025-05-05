import { Injectable, Inject } from '@angular/core';
import { AuthService } from './auth.service';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  cycleId: number;
  brand: string;
  model: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);

  constructor(@Inject(AuthService) private authService: AuthService) {
    this.loadCart();
  }

  private loadCart(): void {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.cartSubject.next(this.cartItems);
    }
  }

  saveCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.cartSubject.next(this.cartItems);
  }

  getItemCount(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getItems() {
    return this.cartItems;
  }

  addItem(item: any) {
    const existingItem = this.cartItems.find(i => i.cycleId === item.cycleId);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cartItems.push({ ...item, quantity: 1 });
    }
    this.saveCart();
  }

  updateQuantity(cycleId: number, quantity: number) {
    const item = this.cartItems.find(i => i.cycleId === cycleId);
    if (item) {
      item.quantity = quantity;
      this.saveCart();
    }
  }

  removeItem(cycleId: number) {
    const userRole = this.authService.getUserRole();
    // if (userRole === 'Admin') {
      this.cartItems = this.cartItems.filter(item => item.cycleId !== cycleId);
      this.saveCart();
    // } else {
    //   alert('You do not have permission to remove items from the cart.');
    // }
  }

  clearCart() {
    this.cartItems = [];
    this.saveCart();
  }

  getTotalItems() {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getTotal(): number {
    return this.getSubtotal();
  }
}
