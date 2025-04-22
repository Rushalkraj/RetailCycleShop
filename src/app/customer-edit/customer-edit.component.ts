import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../services/customer.service';
import { Customer, CustomerUpdateDto } from '../models/customer.model';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-customer-edit',
  templateUrl: './customer-edit.component.html',
  styleUrls: ['./customer-edit.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CustomerEditComponent implements OnInit {
  customerForm: FormGroup;
  isEditMode = false;
  customerId?: number;
  isLoading = false;
  customer?: Customer;
  userRole: string| null = null;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    public router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private authService: AuthService,
  ) {
    this.customerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      shippingAddress: this.fb.group({
        streetLine1: ['', Validators.required],
        streetLine2: [''],
        city: ['', Validators.required],
        state: ['', Validators.required],
        postalCode: ['', Validators.required],
        country: ['', Validators.required]
      })
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      this.customerId = idParam ? +idParam : undefined;
      this.userRole = this.authService.getUserRole();
      this.isEditMode = !!this.customerId;

      if (this.isEditMode) {
        this.loadCustomer();
      } else {
        this.customerForm.reset();
      }
    });
  }

  loadCustomer(): void {
    this.isLoading = true;
    this.customerService.getCustomerById(this.customerId!).subscribe({
      next: (customer) => {
        this.customer = customer;
        
        // Patch basic customer info
        this.customerForm.patchValue({
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone
        });

        // Patch shipping address if it exists
        if (customer.shippingAddress) {
          const shippingAddressGroup = this.customerForm.get('shippingAddress') as FormGroup;
          shippingAddressGroup.patchValue({
            streetLine1: customer.shippingAddress.streetLine1 || '',
            streetLine2: customer.shippingAddress.streetLine2 || '',
            city: customer.shippingAddress.city || '',
            state: customer.shippingAddress.state || '',
            postalCode: customer.shippingAddress.postalCode || '',
            country: customer.shippingAddress.country || ''
          });
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading customer:', err);
        this.toastr.error('Failed to load customer details', 'Error');
      }
    });
  }
  navigateToCustomerList(): void {
    if (this.userRole === 'Admin') {
      this.router.navigate(['/admin/customers']);
    } else if (this.userRole === 'Employee') {
      this.router.navigate(['/employee/customers']);
    }
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      this.toastr.warning('Please fill all required fields', 'Validation Error');
      return;
    }
  
    this.isLoading = true;
    const formValue = this.customerForm.value;
  
    if (this.isEditMode) {
      const updateData = {
        customerId: this.customerId!,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phone: formValue.phone,
        Address: {  
          addressId: this.customer?.shippingAddress?.addressId || 0,
          streetLine1: formValue.shippingAddress.streetLine1,
          streetLine2: formValue.shippingAddress.streetLine2,
          city: formValue.shippingAddress.city,
          state: formValue.shippingAddress.state,
          postalCode: formValue.shippingAddress.postalCode,
          country: formValue.shippingAddress.country,
          isDefaultShipping: true,
          isDefaultBilling: false
        }
      };
  
      this.customerService.updateCustomer(this.customerId!, updateData)
        .subscribe({
          next: () => {
            this.toastr.success('Customer updated successfully');
            if(this.userRole === 'Admin'){
              this.router.navigate(['/admin/customers']);
              }
              else if(this.userRole==='Employee'){
                this.router.navigate(['/employee/customers']);
              }
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Full update error:', err);
            const errorMessage = err.error?.message || 'Failed to update customer';
            this.toastr.error(errorMessage, 'Error');
          }
        });
    }  else {
      const createData = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phone: formValue.phone,
        shippingAddress: {
          streetLine1: formValue.shippingAddress.streetLine1,
          streetLine2: formValue.shippingAddress.streetLine2,
          city: formValue.shippingAddress.city,
          state: formValue.shippingAddress.state,
          postalCode: formValue.shippingAddress.postalCode,
          country: formValue.shippingAddress.country,
          isDefaultShipping: true,
          isDefaultBilling: false
        }
      };

      this.customerService.createCustomer(createData)
        .subscribe({
          next: () => {
            this.toastr.success('Customer created successfully');
            if(this.userRole === 'Admin'){
            this.router.navigate(['/admin/customers']);
            }
            else if(this.userRole==='Employee'){
              this.router.navigate(['/employee/customers']);
            }
          },
          error: (err) => {
            this.isLoading = false;
            this.toastr.error('Failed to create customer', 'Error');
          }
        });
    }
  }
}