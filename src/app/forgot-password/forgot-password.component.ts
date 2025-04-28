import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  message: string = '';

  constructor(private fb: FormBuilder) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      // TODO: Implement password reset logic here
      console.log('Email:', this.forgotPasswordForm.value.email);
      this.message = 'A password reset link has been sent to your email address.';
    } else {
      this.message = 'Please enter a valid email address.';
    }
  }
}