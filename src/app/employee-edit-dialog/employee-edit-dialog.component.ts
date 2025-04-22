// components/employee-edit-dialog/employee-edit-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../services/employee.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-employee-edit-dialog',
  templateUrl: './employee-edit-dialog.component.html',
  styleUrls: ['./employee-edit-dialog.component.scss']
})
export class EmployeeEditDialogComponent {
  editForm: FormGroup;
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<EmployeeEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private toastr: ToastrService
  ) {
    this.editForm = this.fb.group({
      fullName: [data.employee.fullName, Validators.required],
      email: [data.employee.email, [Validators.required, Validators.email]]
    });
  }

  onSave(): void {
    if (this.editForm.valid) {
      this.loading = true;
      this.employeeService.updateEmployee(this.data.employee.id, this.editForm.value)
        .subscribe({
          next: () => {
            this.toastr.success('Employee updated successfully', 'Success');
            this.dialogRef.close(true);
          },
          error: () => {
            this.toastr.error('Failed to update employee', 'Error');
            this.loading = false;
          }
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}