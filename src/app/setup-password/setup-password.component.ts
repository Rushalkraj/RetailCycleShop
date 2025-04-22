import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-setup-password',
  templateUrl: './setup-password.component.html',
  styleUrls: ['./setup-password.component.scss']
})
export class SetupPasswordComponent implements OnInit {
  passwordForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  token = '';
  email = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.email = params['email'] || '';
      
      if (!this.token || !this.email) {
        this.errorMessage = 'Invalid setup link. Please request a new one.';
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.passwordForm.valid && this.token && this.email) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.authService.setupPassword({
        token: this.token,
        email: this.email,
        password: this.passwordForm.value.password
      }).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Password set successfully! You can now login.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error || 'Failed to set password. The link may have expired.';
        }
      });
    }
  }
}