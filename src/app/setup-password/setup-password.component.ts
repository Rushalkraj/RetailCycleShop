import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-setup-password',
  templateUrl: './setup-password.component.html',
  styleUrls: ['./setup-password.component.scss'],
  providers: [MessageService]
})
export class SetupPasswordComponent implements OnInit {
  setupPasswordForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  token: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {
    this.setupPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid or expired setup link'
      });
      this.router.navigate(['/login']);
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  get hasUpperCase(): boolean {
    return /[A-Z]/.test(this.setupPasswordForm.get('password')?.value || '');
  }

  get hasLowerCase(): boolean {
    return /[a-z]/.test(this.setupPasswordForm.get('password')?.value || '');
  }

  get hasNumber(): boolean {
    return /[0-9]/.test(this.setupPasswordForm.get('password')?.value || '');
  }

  get hasSpecialChar(): boolean {
    return /[!@#$%^&*(),.?":{}|<>]/.test(this.setupPasswordForm.get('password')?.value || '');
  }

  onSubmit(): void {
    if (this.setupPasswordForm.valid && this.token) {
      this.isLoading = true;
      const { password } = this.setupPasswordForm.value;

      this.authService.setupPassword({ token: this.token, password }).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Password has been set successfully'
          });
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (error) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to set password. Please try again.'
          });
        }
      });
    }
  }
}