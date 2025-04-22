
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CustomerService } from '../services/customer.service';
import { Customer } from '../models/customer.model';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-customer-management',
  templateUrl: './customer-management.component.html',
  styleUrls: ['./customer-management.component.scss']
})
export class CustomerManagementComponent implements OnInit {
  allCustomers: Customer[] = [];
  customers: Customer[] = [];
  isLoading = false;
  searchTerm = '';
  // customer?: Customer;
  userRole: string | null = null;

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private authService: AuthService,

  ) { }

  ngOnInit(): void {
    this.loadCustomers();
    this.userRole = this.authService.getUserRole();
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.allCustomers = customers;
        this.customers = customers;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading customers:', err);
      }
    });
  }
  deleteCustomer(customerId: number): void {
    const confirmed = confirm('Are you sure you want to delete this customer?');
    if (!confirmed) return;

    this.isLoading = true;
    this.customerService.deleteCustomer(customerId).subscribe({
      next: () => {

        this.customers = this.customers.filter(c => c.customerId !== customerId);
        this.allCustomers = this.allCustomers.filter(c => c.customerId !== customerId);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error deleting customer:', err);
        this.isLoading = false;
        alert('Failed to delete customer. Please try again.');
      }
    });
  }


  searchCustomers(): void {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.customers = [...this.allCustomers];
      return;
    }

    this.customers = this.allCustomers.filter(c => {
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      return (
        fullName.includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term)
      );
    });
  }




  navigateToEditCustomer(customerId: number): void {
    console.log('user role now', this.userRole);
    
    if (this.userRole === 'Admin') {
      this.router.navigate(['/admin/customers/edit', customerId]);
    } else if (this.userRole === 'Employee') {
      console.log('usser', this.userRole);
      
      this.router.navigate(['/employee/customers/edit', customerId]);
    }
  }
}
