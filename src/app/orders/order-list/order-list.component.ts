import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../models/order.model';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = true;
  searchTerm: string = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  visiblePages: number[] = [];
  activeFilter: number | null = null;

  statusOptions = [
    { value: OrderStatus.Pending, label: 'Pending' },
    { value: OrderStatus.Processing, label: 'Processing' },
    { value: OrderStatus.Completed, label: 'Completed' },
    { value: OrderStatus.Cancelled, label: 'Cancelled' }
  ];

  statusFilters = [
    { value: null, label: 'All' },
    { value: OrderStatus.Pending, label: 'Pending' },
    { value: OrderStatus.Processing, label: 'Processing' },
    { value: OrderStatus.Completed, label: 'Completed' },
    { value: OrderStatus.Cancelled, label: 'Cancelled' }
  ];
  selectedType: any;
  availableTypes: any;
  selectedBrand: any;
  availableBrands: any;
  priceRange: any;
  isCustomerView: any;
  cartItemCount: any;
  userRole: string | null = null;

  Math = Math;

  constructor(
    private orderService: OrderService,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching orders', err);
        this.toastr.error('Failed to load orders', 'Error');
        this.loading = false;
      }
    });
  }

  searchOrders(): void {
    this.applyFilters();
  }

  applyFilter(status: number | null): void {
    this.activeFilter = status;
    this.applyFilters();
  }

  private applyFilters(): void {
    // Apply search filter first
    let result = [...this.orders];

    if (this.searchTerm) {
      result = result.filter(order =>
        order.customer.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.customer.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.orderId.toString().includes(this.searchTerm)
      );
    }

    // Then apply status filter if active
    if (this.activeFilter !== null) {
      result = result.filter(order => order.status === this.activeFilter);
    }

    this.filteredOrders = result;
    this.totalItems = result.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.updateVisiblePages();
    this.currentPage = 1;
  }

  get paginatedOrders(): Order[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, endIndex);
  }

  updateVisiblePages(): void {
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    this.visiblePages = [];
    for (let i = start; i <= end; i++) {
      this.visiblePages.push(i);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateVisiblePages();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateVisiblePages();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateVisiblePages();
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case OrderStatus.Pending: return 'status-pending';
      case OrderStatus.Processing: return 'status-processing';
      case OrderStatus.Completed: return 'status-completed';
      case OrderStatus.Cancelled: return 'status-cancelled';
      default: return 'status-default';
    }
  }

  updateOrderStatus(order: Order, newStatus: number): void {
    const originalStatus = order.status;
    order.status = newStatus;

    this.orderService.updateOrderStatus(order.orderId, newStatus).subscribe({
      error: (err) => {
        order.status = originalStatus;
        console.error('Error updating status', err);
        this.toastr.error('Failed to update order status', 'Error');
      },
      complete: () => {
        this.toastr.success('Order status updated', 'Success');
        this.applyFilters();
        this.fetchOrders();
      }
    });
  }

  confirmDelete(order: Order): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete order ${order.orderNumber}? This action cannot be undone.`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteOrder(order)
    });
  }

  deleteOrder(order: Order): void {
    this.loading = true;
    this.orderService.deleteOrder(order.orderId).subscribe({
      next: () => {
        this.toastr.success('Order deleted successfully', 'Success');
        this.fetchOrders(); // Refresh the entire order list
      },
      error: (err) => {
        console.error('Error deleting order', err);
        this.toastr.error('Failed to delete order', 'Error');
        this.loading = false;
      }
    });
  }
}