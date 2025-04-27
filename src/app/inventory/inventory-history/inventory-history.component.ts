import { Component, OnInit } from '@angular/core';
import { InventoryHistoryService } from '../../services/inventory-history.service';
import { MessageService } from 'primeng/api';
import { AuthService } from 'src/app/services/auth.service';

interface InventorySummary {
  criticalStock: number;

  lowStock: number;
  outOfStock: number;
  recentActivity: any[];
  weeklyChanges: any[];
  
  
}

@Component({
  selector: 'app-inventory-history',
  templateUrl: './inventory-history.component.html',
  styleUrls: ['./inventory-history.component.scss'],
  providers: [MessageService]
})
export class InventoryHistoryComponent implements OnInit {
  summary: InventorySummary | null = null;
  loading = true;
  selectedDays = 7;
  userRole: string | null = null;

  // Chart data
  chartData: any;
  chartOptions: any;

  constructor(
    private inventoryService: InventoryHistoryService,
    private messageService: MessageService,
    private  authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadSummary();
    this.initChart();
    this.userRole = this.authService.getUserRole();
  }

  loadSummary(days: number = 7): void {
    this.loading = true;
    this.inventoryService.getInventorySummary(days).subscribe({
      next: (data) => {
        this.summary = data;
        this.updateChart(data.weeklyChanges);
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load inventory data'
        });
        this.loading = false;
      }
    });
  }

  initChart(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          stacked: true
        },
        y: {
          stacked: true
        }
      }
    };
  }

  updateChart(weeklyData: any[]): void {
    this.chartData = {
      labels: weeklyData.map(d => new Date(d.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Restocks',
          backgroundColor: '#2ecc71',
          data: weeklyData.map(d => d.restocks)
        },
        {
          label: 'Reductions',
          backgroundColor: '#e74c3c',
          data: weeklyData.map(d => d.reductions)
        }
      ]
    };
  }

  getSeverity(stockLevel: number): string {
    if (stockLevel <= 2) return 'danger';
    if (stockLevel <= 5) return 'warning';
    return 'success';
  }
}