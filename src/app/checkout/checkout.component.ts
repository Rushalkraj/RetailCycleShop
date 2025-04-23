// checkout.component.ts
import { Component, OnInit } from '@angular/core';
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
  
  PaymentMethod = {
    CreditCard: 'CREDIT_CARD',
    PayPal: 'PAYPAL',
    BankTransfer: 'BANK_TRANSFER'
  };

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private toastr: ToastrService
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
      country: ['India', Validators.required],
      paymentMethod: ['CREDIT_CARD', Validators.required],
      saveShipping: [true],
      saveBilling: [false]
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
    this.loadCart();
  }

  loadCart(): void {
    this.cartItems = this.cartService.getItems().map(item => ({
      ...item,
      brand: item.brand || 'Unknown Brand',
      model: item.model || 'Unknown Model',
      price: item.price || 0,
      quantity: item.quantity || 1,
      cycleId: item.cycleId ,
      imageUrl: item.imageUrl || 'assets/default-cycle.jpg'
    }));

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
      this.selectedCustomer = null;
      this.resetCustomerFields();
      this.enableCustomerForm(true);
    } else if (value) {
      this.isNewCustomer = false;
      const customerId = +value;
      this.selectedCustomer = this.customers.find(c => c.customerId === customerId) || null;

      if (this.selectedCustomer) {
        this.showCustomerForm = true;
        this.populateCustomerForm(this.selectedCustomer);
        this.enableCustomerForm(false);
      }
    } else {
      this.showCustomerForm = false;
      this.selectedCustomer = null;
    }
  }

  private enableCustomerForm(enable: boolean): void {
    const controls = ['firstName', 'lastName', 'email', 'phone', 
                     'streetLine1', 'streetLine2', 'city', 
                     'state', 'postalCode', 'country'];
    
    controls.forEach(control => {
      if (enable) {
        this.checkoutForm.get(control)?.enable();
      } else {
        this.checkoutForm.get(control)?.disable();
      }
    });
  }

  populateCustomerForm(customer: Customer): void {
    this.checkoutForm.patchValue({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      streetLine1: customer.shippingAddress?.streetLine1 || '',
      streetLine2: customer.shippingAddress?.streetLine2 || '',
      city: customer.shippingAddress?.city || '',
      state: customer.shippingAddress?.state || '',
      postalCode: customer.shippingAddress?.postalCode || '',
      country: customer.shippingAddress?.country || 'India'
    });
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
          this.selectedCustomer = customer;
          this.toastr.success('Customer created successfully', 'Success');
          this.isLoading = false;
          this.showCustomerForm = false;
          this.proceedToPayment();

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
      country: 'India'
    });
  }

  getSubtotal(): number {
    return this.cartService.getSubtotal();
  }

  getTax(): number {
    return this.getSubtotal() * 0.0625;
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

// In your checkout.component.ts
proceedToPayment(): void {
  if (this.checkoutForm.invalid) {
    this.toastr.warning('Please fill all required fields', 'Form Incomplete');
    return;
  }

  const formValue = this.checkoutForm.value;
  const orderData = {
    customerId: this.selectedCustomer?.customerId || 0,
    paymentMethod: formValue.paymentMethod,
    customer: {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone
    },
    shippingAddress: {
      addressId: this.selectedCustomer?.shippingAddress?.addressId || 0,
      streetLine1: formValue.streetLine1,
      streetLine2: formValue.streetLine2,
      city: formValue.city,
      state: formValue.state,
      postalCode: formValue.postalCode,
      country: formValue.country
    },
    cartItems: this.cartItems,
    subtotal: this.getSubtotal(),
    tax: this.getTax(),
    totalAmount: this.getTotal()
  };

  this.router.navigate(['/admin/payment'], { 
    state: { orderData } 
  });
}

continueShopping(): void {
  this.router.navigate(['/admin/inventory']);
}
}