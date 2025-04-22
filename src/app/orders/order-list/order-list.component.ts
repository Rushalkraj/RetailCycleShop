import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../models/order.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  statusOptions = [
    { value: 1, label: 'Pending' },
    { value: 2, label: 'Processing' },
    { value: 3, label: 'Completed' },
    { value: 4, label: 'Cancelled' }
  ];

  constructor(
    private orderService: OrderService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching orders', err);
        this.toastr.error('Failed to load orders', 'Error');
        this.loading = false;
      }
    });
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


    this.cdr.detectChanges();

    this.orderService.updateOrderStatus(order.orderId, newStatus).subscribe({
      error: (err) => {
        order.status = originalStatus;
        this.cdr.detectChanges();
        console.error('Error updating status', err);
        this.toastr.error('Failed to update order status', 'Error');
      },
      complete: () => {
        this.toastr.success('Order status updated', 'Success');
        this.cdr.detectChanges();
      }
    });
  }
}