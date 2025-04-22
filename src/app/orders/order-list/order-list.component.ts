import { Component, OnInit } from '@angular/core';
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

  constructor(
    private orderService: OrderService,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) { }

  ngOnInit(): void {
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
    this.currentPage = 1;
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
      }
    });
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

  confirmDelete(order: Order): void {
   
    
    this.confirmationService.confirm({
      message: `Are you sure you want to delete order ${order.orderNumber}? This action cannot be undone.`,
      
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteOrder(order)
    });

  }
 

  deleteOrder(order: Order): void {
    this.orderService.deleteOrder(order.orderId).subscribe({
      next: () => {
        
        this.toastr.success('Order deleted successfully', 'Success');
        // Remove the deleted order from the arrays
        this.orders = this.orders.filter(o => o.orderId !== order.orderId);
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error deleting order', err);
        this.toastr.error('Failed to delete order', 'Error');
      }
    });
  }

  // Pagination methods remain the same
  get totalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}