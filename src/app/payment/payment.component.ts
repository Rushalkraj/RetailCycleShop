// payment.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../services/order.service';
import { ToastrService } from 'ngx-toastr';
import { OrderCreateDto } from '../models/order.model';
import { PaymentMethod } from '../models/payment.model';

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
    { value: PaymentMethod.BankTransfer, label: 'Bank Transfer', icon: 'account_balance' }
  ];

  constructor(
    private router: Router,
    private orderService: OrderService,
    private toastr: ToastrService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.orderData = navigation?.extras?.state?.['orderData'];
    console.log('Order Data from navigation:', this.orderData);
    console.log('Shipping Address:', this.orderData?.shippingAddress);
    console.log('Shipping Address ID:', this.orderData?.shippingAddress?.addressId);



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

  processPayment(): void {
    if (!this.orderData || !this.isPaymentFormValid()) return;

    this.paymentProcessing = true;

    // Validate customer exists
    if (!this.orderData.customer?.customerId) {
      this.toastr.error('Customer information is missing', 'Error');
      this.paymentProcessing = false;
      return;
    }
    if (!this.orderData.customerId) {
      this.toastr.error('Customer ID is missing', 'Error');
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
      customerId: this.orderData.customerId, // Use direct customerId
      shippingAddressId: this.orderData.shippingAddress.addressId, // Use addressId from shippingAddress
      subtotal: this.orderData.subtotal,
      tax: this.orderData.tax,
      totalAmount: this.orderData.totalAmount,
      paymentMethod: this.selectedMethod.toString().toUpperCase(),
      items: this.orderData.cartItems.map((item: any) => ({
        cycleId: item.cycleId,
        quantity: item.quantity,
        unitPrice: item.price,
        brand: item.brand,
        model: item.model
      }))
    };
    if (!this.orderData.customer?.customerId) {
      this.toastr.error('Customer information is missing', 'Error');
      return;
    }
    if (!this.orderData.shippingAddress?.addressId) {
      this.toastr.error('Shipping address is missing', 'Error');
      return;
    }
    if (!this.orderData.cartItems || this.orderData.cartItems.length === 0) {
      this.toastr.error('Cart is empty', 'Error');
      return;
    }

    console.log('Submitting order:', orderCreateDto);

    // Create the order
    this.orderService.createOrder(orderCreateDto).subscribe({
      next: (createdOrder) => {
        console.log('Order created successfully:', createdOrder);
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
        console.error('Full error details:', err);
        if (err.error && err.error.errors) {
          console.error('Validation errors:', err.error.errors);
        }
        this.paymentProcessing = false;
        this.toastr.error(this.getErrorMessage(err), 'Payment Failed');
      }
    });
  }

  private getErrorMessage(err: any): string {
    if (err.message.includes('Customer not found')) {
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