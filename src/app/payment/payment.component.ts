import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../services/order.service';
import { ToastrService } from 'ngx-toastr';
import { OrderCreateDto } from '../models/order.model';
import { PaymentMethod } from '../models/payment.model';
import { PaymentService } from '../services/payment.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent {
  PaymentMethod = PaymentMethod;
  orderData: any;
  paymentProcessing = false;
  selectedMethod: PaymentMethod = PaymentMethod.CreditCard;
  cardDetails = {
    number: '',
    expiry: '',
    cvc: ''
  };

  paymentMethods = [
    { value: PaymentMethod.CreditCard, label: 'Credit Card', icon: 'credit_card' },
    { value: PaymentMethod.PayPal, label: 'PayPal', icon: 'paypal' },
    { value: PaymentMethod.BankTransfer, label: 'Bank Transfer', icon: 'account_balance' },
    { value: PaymentMethod.cashfree, label: 'Cashfree', icon: 'currency_rupee' }
  ];

  constructor(
    private router: Router,
    private orderService: OrderService,
    private toastr: ToastrService,
    private paymentService: PaymentService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.orderData = navigation?.extras?.state?.['orderData'];
    
    if (!this.orderData) {
      this.toastr.error('No order data found', 'Error');
      this.router.navigate(['/checkout']);
    }
  }

  isPaymentFormValid(): boolean {
    if (this.selectedMethod === PaymentMethod.CreditCard) {
      return this.cardDetails.number.length === 19 &&
        this.cardDetails.expiry.length === 5 &&
        this.cardDetails.cvc.length >= 3;
    }
    return true;
  }

  async processPayment(): Promise<void> {
    if (!this.orderData || !this.isPaymentFormValid()) return;
  
    if (this.selectedMethod === PaymentMethod.cashfree) {
      await this.processCashfreePayment();
      return;
    }

    this.paymentProcessing = true;

    // Validate required data
    if (!this.orderData.customer?.customerId || !this.orderData.customerId) {
      this.toastr.error('Customer information is missing', 'Error');
      this.paymentProcessing = false;
      return;
    }

    if (!this.orderData.shippingAddress?.addressId) {
      this.toastr.error('Shipping address ID is missing', 'Error');
      this.paymentProcessing = false;
      return;
    }

    if (!this.orderData.cartItems || this.orderData.cartItems.length === 0) {
      this.toastr.error('Cart is empty', 'Error');
      this.paymentProcessing = false;
      return;
    }

    // Prepare the order data
    const orderCreateDto: OrderCreateDto = {
      customerId: this.orderData.customerId,
      shippingAddressId: this.orderData.shippingAddress.addressId,
      subtotal: this.orderData.subtotal,
      tax: this.orderData.tax,
      totalAmount: this.orderData.totalAmount,
      paymentMethod: this.selectedMethod.toString(),
      items: this.orderData.cartItems.map((item: any) => ({
        cycleId: item.cycleId,
        quantity: item.quantity,
        unitPrice: item.price,
        brand: item.brand,
        model: item.model
      }))
    };

    // Create the order
    this.orderService.createOrder(orderCreateDto).subscribe({
      next: (createdOrder) => {
        this.paymentProcessing = false;
        this.toastr.success('Payment processed successfully', 'Success');
        this.router.navigate(['/admin/order-confirmation'], {
          state: {
            order: createdOrder,
            customer: this.orderData.customer,
            items: this.orderData.cartItems,
            shippingAddress: this.orderData.shippingAddress
          }
        });
      },
      error: (err) => {
        this.paymentProcessing = false;
        this.toastr.error(this.getErrorMessage(err), 'Payment Failed');
      }
    });
  }

  private async processCashfreePayment(): Promise<void> {
    this.paymentProcessing = true;
  
    try {
      // Create Cashfree order
      const orderResponse: any = await this.paymentService
        .createCashfreeOrder(this.orderData.orderId, this.orderData.totalAmount)
        .toPromise();
  
      if (orderResponse.payment_link) {
        // Redirect to Cashfree payment page
        this.paymentService.redirectToCashfree(orderResponse.payment_link);
      } else {
        this.toastr.error('Failed to create payment link', 'Error');
      }
    } catch (error) {
      console.error('Payment error:', error);
      this.toastr.error('Payment processing failed', 'Error');
    } finally {
      this.paymentProcessing = false;
    }
  }

  private getErrorMessage(err: any): string {
    if (err.message?.includes('Customer not found')) {
      return 'The customer associated with this order was not found. Please contact support.';
    }
    if (err.status === 400) {
      return 'Invalid order data. Please check your information and try again.';
    }
    if (err.status === 500) {
      return 'A server error occurred. Please try again later.';
    }
    return 'Payment processing failed. Please try again.';
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s+/g, '');
    if (value.length > 0) {
      value = value.match(new RegExp('.{1,4}', 'g'))?.join(' ') || '';
    }
    this.cardDetails.number = value;
  }

  formatExpiry(event: any): void {
    let value = event.target.value.replace(/\//g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    this.cardDetails.expiry = value;
  }

  cancelPayment(): void {
    this.router.navigate(['/checkout']);
  }
}