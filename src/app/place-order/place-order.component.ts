// import { Component, OnInit, ViewChild } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { InventoryService } from '../services/inventory.service';
// import { CustomerService } from '../services/customer.service';
// import { OrderService } from '../services/order.service';
// import { Cycle } from '../models/inventory.model';
// import { Customer, CustomerAddress, NewCustomerRequest } from '../models/customer.model';
// import { OrderCreateDto, OrderItem, OrderItemDto, PaymentCreateDto } from '../models/order.model';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { AuthService } from 'src/app/services/auth.service';
// import { CustomerModalComponent } from '../customer-modal/customer-modal.component';
// import { CycleService } from '../services/cycle.service';
// import { AddressService } from '../services/address.service';
// import { AddressComponent } from '../address/address.component';
// import { map } from 'rxjs';


// @Component({
//   selector: 'app-place-order',
//   templateUrl: './place-order.component.html',
//   styleUrls: ['./place-order.component.scss']
// })
// export class PlaceOrderComponent implements OnInit {
//   cycleId: number = 0;
//   quantity: number = 1;
//   cycle: Cycle | null = null;
//   customers: Customer[] = [];
//   orderForm: FormGroup;
//   isLoading: boolean = false;
//   errorMessage: string = '';
//   shippingAddresses: { id: number, address: string }[] = [];
//   customerAddresses: CustomerAddress[] = [];
//   @ViewChild(AddressComponent) address!: AddressComponent;
//   @ViewChild(CustomerModalComponent) customerModal!: CustomerModalComponent;
//   isAddingCustomer = false;

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private cycleService: CycleService,
//     private customerService: CustomerService,
//     private orderService: OrderService,
//     private fb: FormBuilder,
//     private authService: AuthService,
//     private addressService: AddressService
//   ) {
//     this.orderForm = this.fb.group({
//       customerId: ['', Validators.required],
//       shippingAddressId: ['', Validators.required],
//       quantity: [1, [Validators.required, Validators.min(1)]],
//       paymentMethod: ['CreditCard', Validators.required]
//     });
//   }

//   ngOnInit(): void {
//     this.route.queryParams.subscribe(params => {
//       this.cycleId = +params['cycleId'] || 0;
//       this.quantity = +params['quantity'] || 1;
//       if (this.cycleId) this.loadCycleDetails();
//     });

//     this.loadCustomers();

//     // Watch for customer changes
//     this.orderForm.get('customerId')?.valueChanges.subscribe(customerId => {
//       if (customerId) {
//         this.loadCustomerAddresses(customerId);
//       }
//     });
//   }
//   openAddCustomerModal(): void {
//     this.isAddingCustomer = true;
//     this.customerModal.open();
//   }
//   openAddAddress(): void {
//     if (this.orderForm.get('customerId')?.value) {
//       this.address.customerId = this.orderForm.get('customerId')?.value;
//       this.address.open();
//     } else {
//       this.errorMessage = 'Please select a customer first';
//     }
//   }
//   onCustomerAdded(newCustomer: NewCustomerRequest): void {
//     this.isLoading = true;
//     this.customerService.createCustomerWithAddress(newCustomer).subscribe({
//       next: (customer) => {
//         this.customers.push(customer);
//         this.orderForm.patchValue({
//           customerId: customer.customerId
//         });

//         // If the customer has a default shipping address, use it
//         if (customer.shippingAddressId) {
//           this.orderForm.patchValue({
//             shippingAddressId: customer.shippingAddressId
//           });
//         }

//         this.isLoading = false;
//       },
//       error: (err) => {
//         this.errorMessage = 'Failed to create customer: ' + err.message;
//         this.isLoading = false;
//       }
//     });
//   }

//   onAddressAdded(newAddress: Omit<CustomerAddress, 'addressId' | 'createdAt'>): void {
//     const customerId = this.orderForm.get('customerId')?.value;
//     if (!customerId) {
//       this.errorMessage = 'Please select a customer first';
//       return;
//     }

//     this.isLoading = true;
//     this.addressService.createAddressForCustomer(customerId, newAddress).subscribe({
//       next: (address) => {
//         // Refresh customer addresses
//         this.loadCustomerAddresses(customerId);
//         // Select the newly added address
//         this.orderForm.patchValue({
//           shippingAddressId: address.addressId
//         });
//         this.isLoading = false;
//       },
//       error: (err) => {
//         this.errorMessage = 'Failed to create address: ' + err.message;
//         this.isLoading = false;
//       }
//     });
//   }

//   onCustomerChange(event: Event): void {
//     const select = event.target as HTMLSelectElement;
//     const customerId = +select.value;
//     if (customerId) {
//       this.loadCustomerAddresses(customerId);
//     }
//   }
//   loadCustomerAddresses(customerId: number): void {
//     this.isLoading = true;
//     this.addressService.getAddressesByCustomerId(customerId).subscribe({
//       next: (addresses) => {
//         this.customerAddresses = addresses;

//         // Set default shipping address if available
//         const defaultShipping = addresses.find(a => a.isDefaultShipping);
//         if (defaultShipping) {
//           this.orderForm.patchValue({
//             shippingAddressId: defaultShipping.addressId
//           });
//         } else if (addresses.length > 0) {
//           // If no default, select the first address
//           this.orderForm.patchValue({
//             shippingAddressId: addresses[0].addressId
//           });
//         }
//         this.isLoading = false;
//       },
//       error: (err) => {
//         console.error('Error loading addresses:', err);
//         this.customerAddresses = [];
//         this.isLoading = false;
//       }
//     });
//   }
//   formatAddress(address: CustomerAddress): string {
//     const parts = [
//       address.streetLine1,
//       address.streetLine2,
//       `${address.city}, ${address.state} ${address.postalCode}`,
//       address.country
//     ].filter(part => part && part.trim() !== '');

//     return parts.join(', ');
//   }
//   openAddCustomer(): void {
//     // Implement modal opening logic
//     // This would typically open a dialog/modal component
//     console.log('Open add customer modal');
//     // After adding, refresh customers list
//     this.loadCustomers();
//   }


//   loadCycleDetails(): void {
//     this.cycleService.getCycleById(this.cycleId).subscribe({
//       next: (cycle: Cycle) => {
//         this.cycle = cycle;
//         this.orderForm.patchValue({
//           quantity: this.quantity
//         });
//       },
//       error: (err) => this.errorMessage = 'Failed to load cycle details'
//     });
//   }

//   loadCustomers(): void {
//     this.customerService.getCustomers().subscribe({
//       next: (customers) => {
//         this.customers = customers;
//         if (customers.length > 0 && !this.orderForm.get('customerId')?.value) {
//           // Auto-select first customer if none selected
//           this.orderForm.patchValue({
//             customerId: customers[0].customerId
//           });
//           this.loadCustomerAddresses(customers[0].customerId);
//         }
//       },
//       error: (err) => {
//         this.errorMessage = 'Failed to load customers';
//         console.error(err);
//       }
//     });
//   }

//   // onCustomerChange(event: Event): void {
//   //   const select = event.target as HTMLSelectElement;
//   //   const customerId = +select.value;
//   //   const customer = this.customers.find(c => c.customerId === customerId);
//   //   if (customer && customer.shippingAddressId) {
//   //     this.orderForm.patchValue({
//   //       shippingAddressId: customer.shippingAddressId
//   //     });
//   //   }
//   // }

//   calculateOrder(): { subtotal: number, tax: number, total: number } {
//     if (!this.cycle) return { subtotal: 0, tax: 0, total: 0 };
//     const quantity = this.orderForm.get('quantity')?.value || 1;
//     const subtotal = this.cycle.price * quantity;
//     const tax = subtotal * 0.0625;
//     const total = subtotal + tax;
//     return { subtotal, tax, total };
//   }

//   // Update the placeOrder() method
//   placeOrder(): void {
//     if (!this.orderForm.valid || !this.cycle) {
//       this.errorMessage = 'Please fill all required fields';
//       return;
//     }

//     this.isLoading = true;
//     const formValue = this.orderForm.value;
//     const { subtotal, tax, total } = this.calculateOrder();

//     const orderItems: OrderItemDto[] = [{
//       cycleId: this.cycle.cycleId,
//       quantity: formValue.quantity,
//       unitPrice: this.cycle.price
//     }];

//     const orderData: OrderCreateDto = {
//       customerId: formValue.customerId,
//       shippingAddressId: formValue.shippingAddressId,
//       subtotal: subtotal,
//       tax: tax,
//       totalAmount: total,
//       items: orderItems
//     };

//     this.orderService.createOrder(orderData).subscribe({
//       next: (order) => {
//         // Create payment
//         const paymentData: PaymentCreateDto = {
//           paymentMethod: formValue.paymentMethod,
//           amount: total,
//           status: 1,
//           paymentType: formValue.paymentMethod === 'CreditCard' ? 1 :
//             formValue.paymentMethod === 'PayPal' ? 2 : 3
//         };

//         this.orderService.createPayment(paymentData).subscribe({
//           next: (payment: any) => {
//             // Associate payment with order
//             this.orderService.updateOrderPayment(order.orderId, payment.paymentId).subscribe({
//               next: () => {
//                 // Track inventory changes
//                 this.orderService.trackInventory(order.orderId).subscribe({
//                   next: () => {
//                     this.isLoading = false;
//                     console.log('Order placed successfully:', order);

//                     this.router.navigate(['/admin/order-confirmation'], {
//                       queryParams: { orderId: order.orderId }
//                     });
//                   },
//                   error: (err) => {
//                     console.error('Inventory tracking failed:', err);
//                     this.router.navigate(['/admin/order-confirmation'], {
//                       queryParams: { orderId: order.orderId }
//                     });
//                   }
//                 });
//               },
//               error: (err) => {
//                 this.isLoading = false;
//                 this.errorMessage = 'Order placed but payment association failed';
//               }
//             });
//           },
//           error: (err) => {
//             this.isLoading = false;
//             this.errorMessage = 'Order placed but payment creation failed';
//           }
//         });
//       },
//       error: (err) => {
//         this.isLoading = false;
//         this.errorMessage = 'Failed to place order';
//       }
//     });
//   }

//   cancel(): void {
//     this.router.navigate(['/admin/inventory']);
//   }
// }