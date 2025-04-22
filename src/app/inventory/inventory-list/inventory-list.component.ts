import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../services/inventory.service';
import { Cycle } from '../../models/inventory.model';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss']
})
export class InventoryListComponent implements OnInit {
  userRole: string | null = null;
  cycles: Cycle[] = [];
  isCustomerView = false;
  loading = true;
  cartItemCount = 0;

  constructor(
    private inventoryService: InventoryService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    const currentPath = this.route.snapshot.routeConfig?.path;
    this.isCustomerView = currentPath === 'shop';
    this.loadCycles();
    this.updateCartCount();
  }

  loadCycles(): void {
    this.loading = true;
    this.inventoryService.getCycles().subscribe({
      next: (data) => {
        this.cycles = data;
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load inventory'
        });
        this.loading = false;
      }
    });
  }
  getStockSeverity(quantity: number): string {
    if (quantity <= 2) return 'danger';
    if (quantity <= 5) return 'warning';
    return 'success';
  }


  updateCartCount(): void {
    this.cartItemCount = this.cartService.getItemCount();
  }

  addToCart(cycle: Cycle): void {
    if (cycle.stockQuantity <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Out of Stock',
        detail: 'This item is currently unavailable'
      });
      return;
    }
    this.cartService.addItem({
      cycleId: cycle.cycleId,
      brand: cycle.brand,
      model: cycle.model,
      price: cycle.price,
      quantity: 1,
      imageUrl: cycle.imageUrl
    });
    this.updateCartCount();
    this.messageService.add({
      severity: 'success',
      summary: 'Added to Cart',
      detail: `${cycle.brand} ${cycle.model} added to cart`
    });
  }


  navigateToCart(): void {
    this.router.navigate([`/${this.userRole?.toLowerCase()}/checkout`]);
  }

  navigateToAddCycle(): void {
    this.router.navigate([`/${this.userRole?.toLowerCase()}/cycles/add`]);
  }

  navigateToEdit(id: number): void {
    const role = this.authService.getUserRole()?.toLowerCase();
    // console.log(`/${role}/cycles/edit/${id}`);

    this.router.navigate([`/${role}/cycles/edit/${id}`]);
  }

  deleteCycle(id: number): void {
    const userRole = this.authService.getUserRole();
    if (userRole === 'Admin') {
      this.inventoryService.deleteCycle(id).subscribe({
        next: () => {
          this.cycles = this.cycles.filter(c => c.cycleId !== id);
          this.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: 'Cycle removed from inventory'
          });
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete cycle'
          });
        }
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Unauthorized',
        detail: 'You do not have permission to delete cycles.'
      });
    }
  }
}