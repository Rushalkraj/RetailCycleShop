// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { OrderService } from '../../services/order.service';
// import { Order } from '../../models/order.model';

// @Component({
//   selector: 'app-order-confirmation',
//   templateUrl: './order-confirmation.component.html',
//   styleUrls: ['./order-confirmation.component.scss']
// })
// export class OrderConfirmationComponent implements OnInit {
//   orderId!: number;
//   order!: Order;
//   isLoading = true;
//   errorMessage = '';

//   constructor(
//     private route: ActivatedRoute,
//     private orderService: OrderService
//   ) { }

//   ngOnInit(): void {
//     this.route.queryParams.subscribe(params => {
//       this.orderId = +params['orderId'];
//       this.loadOrderDetails();
//     });
//   }

//   loadOrderDetails(): void {
//     this.orderService.getOrderById(this.orderId).subscribe({
//       next: (order) => {
//         this.order = order;
//         this.isLoading = false;
//       },
//       error: (err) => {
//         this.errorMessage = 'Failed to load order details';
//         this.isLoading = false;
//       }
//     });
//   }
//   getStatusText(status: number): string {
//     switch(status) {
//       case 1: return 'Pending';
//       case 2: return 'Processing';
//       case 3: return 'Completed';
//       case 4: return 'Cancelled';
//       default: return 'Unknown';
//     }
//   }

//   printOrder(): void {
//     window.print();
//   }
// }