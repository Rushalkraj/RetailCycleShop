// components/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../services/profile.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  profile: any;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private profileService: ProfileService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      currentPassword: [''],
      newPassword: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.profileForm.patchValue({
          fullName: profile.fullName,
          email: profile.email
        });
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        this.errorMessage = 'Failed to load profile data';
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.errorMessage = '';
      this.successMessage = '';

      this.profileService.updateProfile(this.profileForm.value).subscribe({
        next: () => {
          this.successMessage = 'Profile updated successfully';
          this.loadProfile(); // Refresh profile data
        },
        error: (err) => {
          console.error('Failed to update profile', err);
          this.errorMessage = err.error?.message || 'Failed to update profile';
        }
      });
    }
  }
}