import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { InventoryListComponent } from './inventory/inventory-list/inventory-list.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { CurrencyPipe } from '@angular/common';

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
import { ProfileComponent } from './profile/profile.component';
import { EmployeeEditDialogComponent } from './employee-edit-dialog/employee-edit-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';





import { PaymentComponent } from './payment/payment.component';
import { OrderConfirmationComponent } from './orders/order-confirmation/order-confirmation.component';
import { OrderDetailsComponent } from './orders/order-details/order-details.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';


@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    AppComponent,
    LoginComponent,
    InventoryListComponent,
    OrderListComponent,
    

    CycleAddComponent,
    DashboardComponent,
    RegisterComponent,
    InventoryHistoryComponent,
    CheckoutComponent,
    CustomerManagementComponent,
    CustomerEditComponent,
    AdminCreateUserComponent,
    SetupPasswordComponent,
    EmployeeListComponent,
    ProfileComponent,
    EmployeeEditDialogComponent,
    PaymentComponent,
    OrderConfirmationComponent,
    OrderDetailsComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    
   
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    DropdownModule,
    ProgressSpinnerModule,
    CardModule,
    ButtonModule,
    ChartModule,
    TagModule
  ],
  providers: [
    CurrencyPipe,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    ConfirmationService,
    MessageService
  ],


  bootstrap: [AppComponent]
})
export class AppModule { }