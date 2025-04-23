// order-confirmation.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { ToastrService } from 'ngx-toastr';
import { Order } from '../../models/order.model';
import { PaymentMethod } from '../../models/payment.model';

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss']
})
export class OrderConfirmationComponent implements OnInit {
  order: any;
  customer: any;
  items: any[] = [];
  shippingAddress: any;
  loading = false;

  constructor(
    private router: Router,
    private orderService: OrderService,
    private toastr: ToastrService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.order = navigation.extras.state['order'];
      this.customer = navigation.extras.state['customer'];
      this.items = navigation.extras.state['items'];
      this.shippingAddress = navigation.extras.state['shippingAddress'];
    }
  }

  ngOnInit(): void {
    if (!this.order) {
      this.toastr.error('No order information found', 'Error');
      this.router.navigate(['/']);
    }
  }

  getPaymentMethodName(method: string): string {
    switch(method) {
      case 'CREDIT_CARD': return 'Credit Card';
      case 'PAYPAL': return 'PayPal';
      case 'BANK_TRANSFER': return 'Bank Transfer';
      default: return method;
    }
  }

  printInvoice(): void {
    window.print();
  }

  continueShopping(): void {
    this.router.navigate(['/admin/inventory']);
  }
}