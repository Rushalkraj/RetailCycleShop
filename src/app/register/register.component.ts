// register.component.ts
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isSetupMode = false;
  token = '';
  email = '';
  isEmailValid = false;
  isCheckingEmail = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email], [this.validateEmail.bind(this)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['Employee', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.isSetupMode = true;
        this.token = params['token'];
        this.email = params['email'] || '';
        this.registerForm.get('email')?.setValue(this.email);
        this.registerForm.get('email')?.disable();
        this.registerForm.get('role')?.disable();
        this.isEmailValid = true; // Trust the token-based flow
      }
    });

    // For non-token based registration, validate email as user types
    this.registerForm.get('email')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(email => {
          if (this.isSetupMode || !email || this.registerForm.get('email')?.invalid) {
            return of(null);
          }
          this.isCheckingEmail = true;
          return this.authService.validateInvitation(email);
        })
      )
      .subscribe(response => {
        this.isCheckingEmail = false;
        this.isEmailValid = response?.isValid || false;
        this.registerForm.get('email')?.setErrors(
          this.isEmailValid ? null : { notInvited: true }
        );
      });
  }

  validateEmail(control: AbstractControl): Observable<ValidationErrors | null> {
    const email = control.value;
    if (this.isSetupMode || !email) {
      return of(null);
    }
    return this.authService.validateInvitation(email).pipe(
      map(response => response.isValid ? null : { notInvited: true }),
      catchError(() => of({ notInvited: true }))
    );
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      if (this.isSetupMode) {
        this.setupPassword();
      } else {
        this.registerUser();
      }
    }
  }

  private registerUser(): void {
    const { fullName, email, password, role } = this.registerForm.value;
    
    this.authService.register({ fullName, email, password, role }).subscribe({
      next: () => {
        this.successMessage = 'Registration successful. Please login to continue.';
        this.registerForm.reset();
      },
      error: (error) => {
        this.errorMessage = error.error || 'Registration failed. Try again.';
      }
    });
  }

  private setupPassword(): void {
    const { password } = this.registerForm.value;
    
    this.authService.setupPassword({
      token: this.token,
      email: this.email,
      password: password
    }).subscribe({
      next: () => {
        this.successMessage = 'Password set successfully! You can now login.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.error || 'Failed to set password. The link may have expired.';
      }
    });
  }
}