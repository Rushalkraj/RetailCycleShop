// order-confirmation.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { ToastrService } from 'ngx-toastr';
import { Order } from '../../models/order.model';
import { PaymentMethod } from '../../models/payment.model';
import { AuthService } from 'src/app/services/auth.service';

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
  userRole: string | null = null;

  constructor(
    private router: Router,
    private orderService: OrderService,
    private toastr: ToastrService,
    private authService: AuthService,
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.userRole = this.authService.getUserRole();
    this.order = navigation?.extras?.state?.['order'];
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
    switch (method) {
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
    console.log('admin', this.userRole);
    if (this.userRole == 'Admin') {

      this.router.navigate(['/admin/inventory']);
    }
    else if (this.userRole == 'Employee') {
      this.router.navigate(['/employee/inventory']);
    }
  }
}