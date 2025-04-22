import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void { }

  register(): void {
    this.router.navigate(['register']);
  }
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response: any) => {
          localStorage.setItem('token', response.token);
          const role = this.authService.getUserRole();
          console.log('User Role:', role); 

      
          if (role === 'Admin') {
            console.log('Admin role detected');
            this.router.navigate(['/admin/inventory']);
          } else if (role === 'Employee') {
            this.router.navigate(['/employee/inventory']);
          } else if (role === 'Customer') {
            this.router.navigate(['/customer/orders']);
          }
        },
        error: (error) => {
          this.errorMessage = 'Invalid email or password';
        }
      });
    }
  }

}