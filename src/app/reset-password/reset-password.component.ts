import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  email: string = '';
  token: string = '';
  showForm = true;
  loading = false;
  error: string | null = null;
  hidePassword = true;
  hideConfirmPassword = true;
  passwordStrength = 0;
  passwordStrengthText = '';

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        this.createPasswordStrengthValidator()
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    // Subscribe to password changes to update strength
    this.resetForm.get('newPassword')?.valueChanges.subscribe(password => {
      this.updatePasswordStrength(password);
    });

    // Get query parameters
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.token = params['token'] || '';

      // Comment out the redirect for testing
      // if (!this.email || !this.token) {
      //   this.router.navigate(['/forgot-password']);
      // }
    });
  }

  private createPasswordStrengthValidator(): ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;

      return !passwordValid ? { passwordStrength: true } : null;
    };
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  private updatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = 0;
      this.passwordStrengthText = '';
      return;
    }

    let strength = 0;
    const checks = [
      /[A-Z]/.test(password),  // Uppercase
      /[a-z]/.test(password),  // Lowercase
      /[0-9]/.test(password),  // Numbers
      /[!@#$%^&*(),.?":{}|<>]/.test(password),  // Special characters
      password.length >= 8,    // Minimum length
      password.length >= 12    // Preferred length
    ];

    strength = checks.filter(Boolean).length;
    this.passwordStrength = (strength / checks.length) * 100;

    if (this.passwordStrength <= 33) {
      this.passwordStrengthText = 'Weak';
    } else if (this.passwordStrength <= 66) {
      this.passwordStrengthText = 'Medium';
    } else {
      this.passwordStrengthText = 'Strong';
    }
  }

  onSubmit() {
    if (this.resetForm.invalid) {
      if (this.resetForm.errors?.['passwordMismatch']) {
        this.error = 'Passwords do not match';
      } else if (this.resetForm.get('newPassword')?.errors?.['passwordStrength']) {
        this.error = 'Password must contain uppercase, lowercase, number, and special character';
      }
      return;
    }

    this.loading = true;
    this.error = null;

    this.authService.resetPassword(
      this.email,
      this.token,
      this.resetForm.value.newPassword
    ).subscribe({
      next: () => {
        this.router.navigate(['/login'], {
          queryParams: { passwordReset: true }
        });
      },
      error: (err) => {
        this.error = err.error?.message || 'Password reset failed. Please try again.';
        this.loading = false;
      }
    });
  }
}