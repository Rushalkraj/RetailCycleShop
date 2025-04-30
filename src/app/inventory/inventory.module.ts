import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InventoryHistoryComponent } from './inventory-history/inventory-history.component';

// PrimeNG Modules
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { ChartModule } from 'primeng/chart';
import { PaginatorModule } from 'primeng/paginator';

@NgModule({
    declarations: [
        InventoryHistoryComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ToastModule,
        ProgressSpinnerModule,
        TableModule,
        TagModule,
        CardModule,
        ButtonModule,
        DropdownModule,
        TooltipModule,
        ChartModule,
        PaginatorModule
    ],
    exports: [
        InventoryHistoryComponent
    ]
})
export class InventoryModule { } 