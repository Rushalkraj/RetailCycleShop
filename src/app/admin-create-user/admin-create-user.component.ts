import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-create-user',
  templateUrl: './admin-create-user.component.html',
  styleUrls: ['./admin-create-user.component.scss']
})
export class AdminCreateUserComponent {
  createUserForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  // setupLink = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.createUserForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['Employee', Validators.required],
      address: ['',],
      phoneNumber: ['',]
    });
  }

  // admin-create-user.component.ts
  onSubmit(): void {
    if (this.createUserForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      console.log(this.createUserForm.value);

      this.authService.adminCreateUser(this.createUserForm.value).subscribe({

        next: (response: any) => {

          this.isLoading = false;
          this.successMessage = `Invitation sent to ${response.email}`;
          this.createUserForm.reset({
            role: 'Employee'
          });
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 401) {
            this.errorMessage = 'Unauthorized - Please login as admin';
          } else {
            this.errorMessage = error.error?.message || error.message || 'Failed to create user';
          }
        }
      });
    }

  }


}