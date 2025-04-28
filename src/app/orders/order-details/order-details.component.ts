import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { CycleService } from '../../services/cycle.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {
  order: Order | null = null;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private cycleService: CycleService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const orderId = +params['id']; // Convert the string to a number
      this.fetchOrderDetails(orderId);
    });
  }

  fetchOrderDetails(orderId: number): void {
    this.orderService.getOrderById(orderId).subscribe(order => {
      if (order && order.orderItems) {
        // Create an array of cycle detail requests for each order item
        const cycleRequests = order.orderItems.map(item =>
          this.cycleService.getCycleById(item.cycleId).pipe(
            map(cycle => {
              item.cycle = cycle;
              return item;
            })
          )
        );

        // Wait for all cycle details to be fetched
        if (cycleRequests.length > 0) {
          forkJoin(cycleRequests).subscribe(() => {
            this.order = order;
          });
        } else {
          this.order = order;
        }
      } else {
        this.order = order;
      }
    });
  }
}
