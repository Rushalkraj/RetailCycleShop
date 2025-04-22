import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../services/employee.service';
import { ConfirmationService } from 'primeng/api';
import { Employee } from '../models/employee.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
  providers: [ConfirmationService]
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  loading = true;

  constructor(
    private employeeService: EmployeeService,
    private confirmationService: ConfirmationService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
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

  confirmDelete(employee: Employee): void {
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
