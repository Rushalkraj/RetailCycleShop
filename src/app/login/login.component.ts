import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Check for saved credentials if remember me was checked
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.loginForm.patchValue({
        email: savedEmail,
        rememberMe: true
      });
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password, rememberMe } = this.loginForm.value;

      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      this.authService.login({ email, password }).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Login successful!'
          });
          this.navigateBasedOnRole(response.role);

          // Get user role and navigate accordingly
          const role = this.authService.getUserRole();
          if (role) {
            this.navigateBasedOnRole(role);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Unable to determine user role. Please contact support.'
            });
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Login failed. Please try again.'
          });
        }
      });
    }
  }

  private navigateBasedOnRole(role: string): void {
    switch (role) {
      case 'Admin':
        this.router.navigate(['/admin']);
        break;
      case 'Employee':
        this.router.navigate(['/employee']);
        break;
      // case 'Customer':
      //   this.router.navigate(['/customer/dashboard']);
      //   break;
      // default:
      //   this.router.navigate(['/']);
      //   break;
    }
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  // Social login methods
  loginWithGoogle(): void {
    // Implement Google login
    this.messageService.add({
      severity: 'info',
      summary: 'Coming Soon',
      detail: 'Google login will be available soon!'
    });
  }

  loginWithFacebook(): void {
    // Implement Facebook login
    this.messageService.add({
      severity: 'info',
      summary: 'Coming Soon',
      detail: 'Facebook login will be available soon!'
    });
  }
}