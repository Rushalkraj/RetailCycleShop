import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { InventoryListComponent } from './inventory/inventory-list/inventory-list.component';

import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';


import { CycleAddComponent } from './cycles/cycle-add/cycle-add.component';

import { DashboardComponent } from './dashboard/dashboard.component';

import { RegisterComponent } from './register/register.component';

import { CheckoutComponent } from './checkout/checkout.component';
import { CustomerManagementComponent } from './customer-management/customer-management.component';
import { CustomerEditComponent } from './customer-edit/customer-edit.component';
import { OrderListComponent } from './orders/order-list/order-list.component';
import { SetupPasswordComponent } from './setup-password/setup-password.component';
import { AdminCreateUserComponent } from './admin-create-user/admin-create-user.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { InventoryHistoryComponent } from './inventory/inventory-history/inventory-history.component';
import { ProfileComponent } from './profile/profile.component';
import { PaymentComponent } from './payment/payment.component';
import { OrderConfirmationComponent } from './orders/order-confirmation/order-confirmation.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: DashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['Admin'] },
    children: [
      { path: 'inventory', component: InventoryListComponent },

      { path: 'orders', component: OrderListComponent },
      { path: 'cycles/add', component: CycleAddComponent },
      { path: 'cycles/edit/:id', component: CycleAddComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'customers', component: CustomerManagementComponent },
      { path: 'customers/add', component: CustomerEditComponent },
      { path: 'customers/edit/:id', component: CustomerEditComponent },
      { path: 'create-user/register', component: RegisterComponent },
      { path: 'account/setup-password', component: SetupPasswordComponent },
      { path: 'admin-create-user', component: AdminCreateUserComponent },
      { path: 'employees', component: EmployeeListComponent },
      { path: 'inventory-history', component: InventoryHistoryComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'payment', component: PaymentComponent,  data: { title: 'Payment' }},
      {  path: 'order-confirmation',  component: OrderConfirmationComponent,  data: { title: 'Order Confirmation' }    },
      { path: '', redirectTo: 'inventory', pathMatch: 'full' },
      
    ]
  },
  {
    path: 'employee',
    component: DashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['Employee'] },
    children: [
      { path: 'inventory', component: InventoryListComponent },

      { path: 'orders', component: OrderListComponent },
      { path: 'cycles/add', component: CycleAddComponent },
      { path: 'cycles/edit/:id', component: CycleAddComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'customers', component: CustomerManagementComponent },
      { path: 'customers/add', component: CustomerEditComponent },
      { path: 'customers/edit/:id', component: CustomerEditComponent },
      { path: 'create-user/register', component: RegisterComponent },
      { path: 'account/setup-password', component: SetupPasswordComponent },
      { path: 'admin-create-user', component: AdminCreateUserComponent },
      { path: 'inventory-history', component: InventoryHistoryComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'payment', component: PaymentComponent,  data: { title: 'Payment' }},
      {  path: 'order-confirmation',  component: OrderConfirmationComponent,  data: { title: 'Order Confirmation' }    },

      { path: '', redirectTo: 'inventory', pathMatch: 'full' }
    ]
  },




  { path: 'register', component: RegisterComponent },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'shop', component: InventoryListComponent },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
