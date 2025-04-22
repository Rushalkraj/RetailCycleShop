import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { InventoryListComponent } from './inventory/inventory-list/inventory-list.component'; 
import { AuthGuard } from './guards/auth.guard'; 
import { RoleGuard } from './guards/role.guard'; 
import { AuthInterceptor } from './interceptors/auth.interceptor';

import { CycleAddComponent } from './cycles/cycle-add/cycle-add.component';

import { DashboardComponent } from './dashboard/dashboard.component';
import { AppRoutingModule } from './app-routing.module';

import { RegisterComponent } from './register/register.component';


import { InventoryHistoryComponent } from './inventory/inventory-history/inventory-history.component';


import { CheckoutComponent } from './checkout/checkout.component';
import { CustomerManagementComponent } from './customer-management/customer-management.component';
import { CustomerEditComponent } from './customer-edit/customer-edit.component';


import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { OrderListComponent } from './orders/order-list/order-list.component';
import { AdminCreateUserComponent } from './admin-create-user/admin-create-user.component';
import { SetupPasswordComponent } from './setup-password/setup-password.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';

import { TagModule } from 'primeng/tag';








@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    InventoryListComponent,
    OrderListComponent,

    CycleAddComponent,
    DashboardComponent, RegisterComponent,  InventoryHistoryComponent, CheckoutComponent, CustomerManagementComponent, CustomerEditComponent, AdminCreateUserComponent, SetupPasswordComponent, EmployeeListComponent 
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    TableModule,
  ToastModule,
  ConfirmDialogModule, DropdownModule,
  ProgressSpinnerModule,
  CardModule,
  ButtonModule,
  ChartModule,
  TagModule
  ],
  providers: [
  
      { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
      ConfirmationService,
      MessageService
    ],
    

  bootstrap: [AppComponent]
})
export class AppModule { }