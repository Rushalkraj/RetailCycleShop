import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerService } from '../services/customer.service';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Customer, CustomerCreateDto, CustomerUpdateDto } from '../models/customer.model';
import { OrderCreateDto } from '../models/order.model';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';

interface CartItem {
  cycleId: number;
  brand: string;
  model: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface OrderData {
  shipping: any;
  payment: any;
  items: CartItem[];
  total: number;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  providers: [MessageService]
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  customers: Customer[] = [];
  cartItems: CartItem[] = [];
  isLoading = false;
  showCustomerForm = false;
  isNewCustomer = false;
  selectedCustomer: Customer | null = null;
  shippingForm: FormGroup;
  paymentForm: FormGroup;
  selectedPayment: string = 'credit';
  subtotal: number = 0;
  shippingCost: number = 5.99;
  tax: number = 0;
  total: number = 0;
  userRole!: string | null;

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
    private toastr: ToastrService,
    private authService: AuthService,
    private messageService: MessageService,
    private auth: AuthService
  ) {
    this.userRole = this.auth.getUserRole();
    this.checkoutForm = this.fb.group({
      customerId: ['', Validators.required],
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$'), Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$'), Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$')]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      streetLine1: ['', [Validators.required, Validators.minLength(5)]],
      streetLine2: [''],
      city: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$'), Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$'), Validators.minLength(2)]],
      postalCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      country: ['India', Validators.required],
      paymentMethod: ['CREDIT_CARD', Validators.required],
      saveShipping: [true],
      saveBilling: [false]
    });

    this.shippingForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]]
    });

    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      cardName: ['', [Validators.required, Validators.minLength(2)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
    this.loadCartItems();
    this.calculateTotals();
  }

  loadCartItems(): void {
    this.cartItems = this.cartService.getItems().map(item => ({
      ...item,
      brand: item.brand || 'Unknown Brand',
      model: item.model || 'Unknown Model',
      price: item.price || 0,
      quantity: item.quantity || 1,
      cycleId: item.cycleId,
      imageUrl: item.imageUrl || 'assets/default-cycle.jpg'
    }));
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
      const controls = this.checkoutForm.controls;
      let errorMessage = 'Please correct the following errors:\n';

      if (controls['firstName'].errors) {
        if (controls['firstName'].errors['required']) errorMessage += '- First name is required\n';
        if (controls['firstName'].errors['pattern']) errorMessage += '- First name should only contain letters\n';
        if (controls['firstName'].errors['minlength']) errorMessage += '- First name should be at least 2 characters\n';
      }
      if (controls['lastName'].errors) {
        if (controls['lastName'].errors['required']) errorMessage += '- Last name is required\n';
        if (controls['lastName'].errors['pattern']) errorMessage += '- Last name should only contain letters\n';
        if (controls['lastName'].errors['minlength']) errorMessage += '- Last name should be at least 2 characters\n';
      }
      if (controls['email'].errors) {
        if (controls['email'].errors['required']) errorMessage += '- Email is required\n';
        if (controls['email'].errors['email'] || controls['email'].errors['pattern']) errorMessage += '- Please enter a valid email address\n';
      }
      if (controls['phone'].errors) {
        if (controls['phone'].errors['required']) errorMessage += '- Phone number is required\n';
        if (controls['phone'].errors['pattern']) errorMessage += '- Phone number must be 10 digits\n';
      }
      if (controls['streetLine1'].errors) {
        if (controls['streetLine1'].errors['required']) errorMessage += '- Street address is required\n';
        if (controls['streetLine1'].errors['minlength']) errorMessage += '- Street address should be at least 5 characters\n';
      }
      if (controls['city'].errors) {
        if (controls['city'].errors['required']) errorMessage += '- City is required\n';
        if (controls['city'].errors['pattern']) errorMessage += '- City should only contain letters\n';
        if (controls['city'].errors['minlength']) errorMessage += '- City should be at least 2 characters\n';
      }
      if (controls['state'].errors) {
        if (controls['state'].errors['required']) errorMessage += '- State is required\n';
        if (controls['state'].errors['pattern']) errorMessage += '- State should only contain letters\n';
        if (controls['state'].errors['minlength']) errorMessage += '- State should be at least 2 characters\n';
      }
      if (controls['postalCode'].errors) {
        if (controls['postalCode'].errors['required']) errorMessage += '- Postal code is required\n';
        if (controls['postalCode'].errors['pattern']) errorMessage += '- Postal code must be 6 digits\n';
      }

      this.toastr.warning(errorMessage, 'Validation Error');
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
          const errorMessage = err.message || 'Failed to create customer';
          this.toastr.error(errorMessage, 'Error');
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

  updateQuantity(item: CartItem, quantity: number): void {
    if (quantity > 0) {
      this.cartService.updateQuantity(item.cycleId, quantity);
      this.toastr.info('Quantity updated', 'Cart Updated');
    }
  }

  changeQuantity(item: CartItem, delta: number): void {
    const newQuantity = item.quantity + delta;
    if (newQuantity >= 1) {
      item.quantity = newQuantity;
      this.updateQuantity(item, newQuantity);
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

  proceedToPayment(): void {
    console.log('Proceeding to payment');
    
    if (this.checkoutForm.invalid) {
      this.toastr.warning('Please fill all required fields', 'Form Incomplete');
      return;
    }

    const formValue = this.checkoutForm.value;

    if (this.isNewCustomer) {
      this.saveCustomer();
      this.isNewCustomer = false;
      return;
    }

    const orderData = {
      customerId: this.selectedCustomer?.customerId,
      paymentMethod: formValue.paymentMethod,
      customer: this.selectedCustomer,
      shippingAddress: this.selectedCustomer?.shippingAddress,
      cartItems: this.cartItems,
      subtotal: this.getSubtotal(),
      tax: this.getTax(),
      totalAmount: this.getTotal(),
      employeeId: this.authService.getEmployeeId()
    };
    if (this.userRole === 'Employee') {
      this.router.navigate(['/employee/payment'], {
        state: { orderData }
      });
    } else if (this.userRole === 'Admin') {
      this.router.navigate(['/admin/payment'], {
        state: { orderData }
      });
    }
    // this.router.navigate(['/admin/payment'], {
    //   state: { orderData }
    // });
  }

  continueShopping(): void {
    if (this.userRole === 'Admin') {
      this.router.navigate(['/admin/inventory']);
    }
    else if (this.userRole === 'Employee') {
      this.router.navigate(['/employee/inventory']);
    }
  }

  calculateTotals(): void {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.tax = this.subtotal * 0.06;
    this.total = this.subtotal + this.shippingCost + this.tax;
  }

  selectPayment(method: string): void {
    this.selectedPayment = method;
  }

  isFormValid(): boolean {
    if (this.selectedPayment === 'credit') {
      return this.shippingForm.valid && this.paymentForm.valid;
    }
    return this.shippingForm.valid;
  }

  placeOrder(): void {
    if (!this.isFormValid()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill in all required fields correctly'
      });
      return;
    }

    const orderData: OrderData = {
      shipping: this.shippingForm.value,
      payment: this.selectedPayment === 'credit' ? this.paymentForm.value : null,
      items: this.cartItems,
      total: this.total
    };
    if(this.userRole === 'Admin') {
    this.router.navigate(['/admin/payment'], {
      state: { orderData }
    });
  }else if (this.userRole === 'Employee') {
    this.router.navigate(['/employee/payment'], {
      state: { orderData }
    });
  }
  }
}