import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerService } from '../services/customer.service';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Customer, CustomerCreateDto, CustomerUpdateDto } from '../models/customer.model';
import { OrderCreateDto } from '../models/order.model';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  customers: Customer[] = [];
  cartItems: any[] = [];
  isLoading = false;
  showCustomerForm = false;
  isNewCustomer = false;
  selectedCustomer: Customer | null = null;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private toastr: ToastrService,

  ) {
    this.checkoutForm = this.fb.group({
      customerId: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      streetLine1: ['', Validators.required],
      streetLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
      paymentMethod: ['CreditCard', Validators.required],
      saveShipping: [true],
      saveBilling: [false]
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
    this.loadCart();
  }

  loadCart(): void {
    this.cartItems = this.cartService.getItems();
    if (this.cartItems.length === 0) {
      this.toastr.warning('Your cart is empty', 'Cart Empty');
      this.router.navigate(['/admin/inventory']);
    }
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load customers', 'Error');
        this.isLoading = false;
      }
    });
  }

  onCustomerSelected(event: any): void {
    const value = event.target.value;

    if (value === 'new') {
      this.isNewCustomer = true;
      this.showCustomerForm = true;
      this.resetCustomerFields();
    } else if (value) {
      this.isNewCustomer = false;
      const customerId = +value;
      const customer = this.customers.find(c => c.customerId === customerId);

      if (customer) {
        this.selectedCustomer = customer;
        this.showCustomerForm = true;
        console.log('Shipping Address:', customer.shippingAddress);
        this.populateCustomerForm(customer);
      }
    } else {
      this.showCustomerForm = false;
      this.selectedCustomer = null;
    }
  }
  populateCustomerForm(customer: Customer): void {
    // Basic customer info
    this.checkoutForm.patchValue({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email || '',
      phone: customer.phone || ''
    });
    // Shipping address if available
    if (customer.shippingAddress) {
      this.checkoutForm.patchValue({
        streetLine1: customer.shippingAddress.streetLine1 || '',
        streetLine2: customer.shippingAddress.streetLine2 || '',
        city: customer.shippingAddress.city || '',
        state: customer.shippingAddress.state || '',
        postalCode: customer.shippingAddress.postalCode || '',
        country: customer.shippingAddress.country || ''
      });
    }
  }
  cancelCustomerEdit(): void {
    this.showCustomerForm = false;
    if (this.selectedCustomer) {
      this.checkoutForm.patchValue({
        firstName: this.selectedCustomer.firstName,
        lastName: this.selectedCustomer.lastName,
        email: this.selectedCustomer.email,
        phone: this.selectedCustomer.phone,
        streetLine1: this.selectedCustomer.shippingAddress?.streetLine1 || '',
        streetLine2: this.selectedCustomer.shippingAddress?.streetLine2 || '',
        city: this.selectedCustomer.shippingAddress?.city || '',
        state: this.selectedCustomer.shippingAddress?.state || '',
        postalCode: this.selectedCustomer.shippingAddress?.postalCode || '',
        country: this.selectedCustomer.shippingAddress?.country || ''
      });
    }
  }

  saveCustomer(): void {
    if (this.checkoutForm.invalid) {
      this.toastr.warning('Please fill all required fields', 'Validation Error');
      return;
    }

    const formValue = this.checkoutForm.value;
    const customerData: CustomerCreateDto = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
      shippingAddress: {
        streetLine1: formValue.streetLine1,
        streetLine2: formValue.streetLine2,
        city: formValue.city,
        state: formValue.state,
        postalCode: formValue.postalCode,
        country: formValue.country,
        isDefaultShipping: formValue.saveShipping,
        isDefaultBilling: formValue.saveBilling
      }
    };

    this.isLoading = true;

    if (this.isNewCustomer) {
      this.customerService.createCustomer(customerData).subscribe({
        next: (customer) => {
          this.customers.push(customer);
          this.checkoutForm.patchValue({ customerId: customer.customerId });
          this.toastr.success('Customer created successfully', 'Success');
          this.isLoading = false;
          this.showCustomerForm = false;
        },
        error: (err) => {
          this.toastr.error('Failed to create customer', 'Error');
          this.isLoading = false;
        }
      });
    } else if (this.selectedCustomer) {
      const updateData: CustomerUpdateDto = {
        customerId: this.selectedCustomer.customerId,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone,
        shippingAddress: {
          ...customerData.shippingAddress,
          addressId: this.selectedCustomer.shippingAddress?.addressId || 0
        }
      };

      this.customerService.updateCustomer(this.selectedCustomer.customerId, updateData)
        .subscribe({
          next: (updatedCustomer) => {
            this.toastr.success('Customer updated successfully');
            this.isLoading = false;
            this.showCustomerForm = false;
          },
          error: (err) => {
            this.toastr.error('Failed to update customer');
            this.isLoading = false;
          }
        });
    }
  }

  resetCustomerFields(): void {
    this.checkoutForm.patchValue({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      streetLine1: '',
      streetLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    });
  }

  getSubtotal(): number {
    return this.cartService.getSubtotal();
  }

  getTax(): number {
    return this.getSubtotal() * 0.0625; // 6.25% tax
  }

  getTotal(): number {
    return this.getSubtotal() + this.getTax();
  }

  updateQuantity(item: any, quantity: number): void {
    if (quantity > 0) {
      this.cartService.updateQuantity(item.cycleId, quantity);
      this.toastr.info('Quantity updated', 'Cart Updated');
    }
  }

  removeItem(cycleId: number): void {
    this.cartService.removeItem(cycleId);
    this.cartItems = this.cartService.getItems();
    this.toastr.info('Item removed from cart', 'Cart Updated');
    if (this.cartItems.length === 0) {
      this.router.navigate(['/admin/inventory']);
    }
  }
  private createOrder(customerId: number, addressId: number): void {
    const formValue = this.checkoutForm.value;
    const orderData: OrderCreateDto = {
      customerId: customerId,
      shippingAddressId: addressId,
      subtotal: this.getSubtotal(),
      tax: this.getTax(),
      totalAmount: this.getTotal(),
      paymentMethod: formValue.paymentMethod,
      items: this.cartItems.map(item => ({
        cycleId: item.cycleId,
        quantity: item.quantity,
        unitPrice: item.price
      }))
    };

    console.log('Order data being sent:', orderData);

    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        this.cartService.clearCart();
        this.toastr.success('Order placed successfully', 'Success');
        this.router.navigate(['/admin/order-confirmation'], {
          queryParams: { orderId: order.orderId }
        });
      },
      error: (err) => {
        console.error('Order creation error:', err);
        this.isLoading = false;
        this.toastr.error('Failed to place order: ' + err?.error?.message, 'Error');
        console.log('Full error object:', err);
        console.log('Error response:', err.error);
      }
    });
  }



  placeOrder(): void {
    console.log('Cart items:', this.cartItems);
    if (this.checkoutForm.invalid) {
      this.toastr.warning('Please fill all required fields', 'Form Incomplete');
      return;
    }

    const formValue = this.checkoutForm.value;


    if (this.isNewCustomer) {
      // Handle new customer creation first
      const customerData = this.prepareCustomerData();
      this.customerService.createCustomer(customerData).subscribe({
        next: (customer) => {
          if (customer.shippingAddress?.addressId) {
            this.createOrder(customer.customerId, customer.shippingAddress.addressId);
          } else {
            this.isLoading = false;
            this.toastr.error('Shipping address not created', 'Error');
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error('Failed to create customer', 'Error');
        }
      });
    } else if (this.selectedCustomer) {
      // For existing customer, ensure we have shipping address ID
      if (this.selectedCustomer.shippingAddress?.addressId) {
        this.createOrder(this.selectedCustomer.customerId, this.selectedCustomer.shippingAddress.addressId);
      } else {
        // Update customer with new shipping address first
        this.updateCustomerAndCreateOrder();
      }
    }
  }

  private prepareCustomerData(): CustomerCreateDto {
    const formValue = this.checkoutForm.value;
    return {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
      shippingAddress: {
        streetLine1: formValue.streetLine1,
        streetLine2: formValue.streetLine2,
        city: formValue.city,
        state: formValue.state,
        postalCode: formValue.postalCode,
        country: formValue.country,
        isDefaultShipping: formValue.saveShipping,
        isDefaultBilling: formValue.saveBilling
      }
    };
  }

  private updateCustomerAndCreateOrder(): void {
    const formValue = this.checkoutForm.value;
    const customerData = this.prepareCustomerData();

    this.customerService.updateCustomer(
      this.selectedCustomer!.customerId,
      {
        customerId: this.selectedCustomer!.customerId,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone,
        shippingAddress: {
          ...customerData.shippingAddress,
          addressId: 0 // Will be set by backend
        }
      }
    ).subscribe({
      next: (updatedCustomer) => {
        if (updatedCustomer.shippingAddress?.addressId) {
          this.createOrder(updatedCustomer.customerId, updatedCustomer.shippingAddress.addressId);
        } else {
          this.isLoading = false;
          this.toastr.error('Failed to update shipping address', 'Error');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Failed to update customer', 'Error');
      }
    });
  }

  continueShopping(): void {
    this.router.navigate(['/admin/inventory']);
  }
}