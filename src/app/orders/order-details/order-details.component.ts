import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { CycleService } from '../../services/cycle.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

interface Cycle {
  cycleId: number;
  brand: string;
  model: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

interface OrderItem {
  orderItemId: number;
  orderId: number;
  cycleId: number;
  quantity: number;
  unitPrice: number;
  cycle?: Cycle;
}

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {
  order: Order | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private cycleService: CycleService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.route.params.subscribe(params => {
      const orderId = +params['id'];
      this.fetchOrderDetails(orderId);
    });
  }

  fetchOrderDetails(orderId: number): void {
    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        if (order && order.orderItems) {
          const cycleRequests = order.orderItems.map(item =>
            this.cycleService.getCycleById(item.cycleId).pipe(
              map(cycle => {
                item.cycle = cycle as Cycle;
                return item;
              })
            )
          );

          if (cycleRequests.length > 0) {
            forkJoin(cycleRequests).subscribe({
              next: () => {
                this.order = order;
                this.loading = false;
              },
              error: (error) => {
                console.error('Error fetching cycle details:', error);
                this.loading = false;
              }
            });
          } else {
            this.order = order;
            this.loading = false;
          }
        } else {
          this.order = order;
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error fetching order details:', error);
        this.loading = false;
      }
    });
  }

  printOrder(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['admin/orders']);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  }
}
