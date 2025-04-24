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
  filteredCycles: Cycle[] = [];
  isCustomerView = false;
  loading = true;
  cartItemCount = 0;
  
  // Filter properties
  searchText = '';
  selectedType = '';
  selectedBrand = '';
  priceRange = '';
  availableTypes: string[] = [];
  availableBrands: string[] = [];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 12;

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
        this.filteredCycles = [...data];
        this.extractFilterOptions();
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
  getStockPercentage(quantity: number): number {
    // Assuming max stock for percentage calculation is 10
    const maxStock = 10;
    return Math.min((quantity / maxStock) * 100, 100);
  }

  extractFilterOptions(): void {
    this.availableTypes = [...new Set(this.cycles.map(c => c.type))];
    this.availableBrands = [...new Set(this.cycles.map(c => c.brand))];
  }

  applyFilters(): void {
    this.currentPage = 1;
    
    this.filteredCycles = this.cycles.filter(cycle => {
      const matchesSearch = !this.searchText || 
        cycle.brand.toLowerCase().includes(this.searchText.toLowerCase()) || 
        cycle.model.toLowerCase().includes(this.searchText.toLowerCase());
      
      const matchesType = !this.selectedType || cycle.type === this.selectedType;
      const matchesBrand = !this.selectedBrand || cycle.brand === this.selectedBrand;
      
      let matchesPrice = true;
      if (this.priceRange) {
        const [min, max] = this.priceRange.split('-').map(Number);
        matchesPrice = cycle.price >= min && cycle.price <= max;
      }
      
      return matchesSearch && matchesType && matchesBrand && matchesPrice;
    });
  }

  resetFilters(): void {
    this.searchText = '';
    this.selectedType = '';
    this.selectedBrand = '';
    this.priceRange = '';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!this.searchText || !!this.selectedType || !!this.selectedBrand || !!this.priceRange;
  }

  getStockSeverityClass(quantity: number): string {
    if (quantity <= 2) return 'stock-danger';
    if (quantity <= 5) return 'stock-warning';
    return 'stock-success';
  }

  getStockStatusText(quantity: number): string {
    if (quantity <= 0) return 'Out of stock';
    if (quantity <= 2) return 'Low stock';
    if (quantity <= 5) return 'Limited stock';
    return 'In stock';
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
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
    this.router.navigate([`/${role}/cycles/edit/${id}`]);
  }

  deleteCycle(id: number): void {
    const userRole = this.authService.getUserRole();
    if (userRole === 'Admin') {
      if (confirm('Are you sure you want to delete this cycle? This action cannot be undone.')) {
        this.inventoryService.deleteCycle(id).subscribe({
          next: () => {
            this.cycles = this.cycles.filter(c => c.cycleId !== id);
            this.filteredCycles = this.filteredCycles.filter(c => c.cycleId !== id);
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
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Unauthorized',
        detail: 'You do not have permission to delete cycles.'
      });
    }
  }

  nextPage(): void {
    this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}