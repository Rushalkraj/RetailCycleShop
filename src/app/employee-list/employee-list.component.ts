// components/employee-list/employee-list.component.ts
import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../services/employee.service';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeEditDialogComponent } from '../employee-edit-dialog/employee-edit-dialog.component';
import { Employee } from '../models/employee.model';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
  providers: [ConfirmationService]
})
export class EmployeeListComponent implements OnInit {
  employees: any[] = [];
  loading = true;
  searchTerm: string = '';
  filteredEmployees: any[] = [];

  constructor(
    private employeeService: EmployeeService,
    private confirmationService: ConfirmationService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) { }


  ngOnInit(): void {
    this.loadEmployees();
  }

  searchEmployees(): void {
    this.filteredEmployees = this.employees.filter(employee =>
      employee.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get displayedEmployees(): any[] {
    return this.searchTerm ? this.filteredEmployees : this.employees;
  }
  loadEmployees(): void {
    this.loading = true;
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Failed to load employees', 'Error');
        this.loading = false;
      }
    });
  }

  openEditDialog(employee: Employee): void {
    const dialogRef = this.dialog.open(EmployeeEditDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      panelClass: 'modern-dialog',
      autoFocus: false,
      disableClose: true,
      backdropClass: 'dialog-backdrop',
      data: { employee }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEmployees();
      }
    });
  }

  confirmDelete(employee: any): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${employee.fullName}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteEmployee(employee.id)
    });
  }


  deleteEmployee(id: string): void {
    this.employeeService.deleteEmployee(id).subscribe({
      next: () => {
        this.toastr.success('Employee deleted successfully', 'Success');
        this.loadEmployees();
      },
      error: () => {
        this.toastr.error('Failed to delete employee', 'Error');
      }
    });
  }
}