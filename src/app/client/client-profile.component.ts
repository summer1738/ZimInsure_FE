import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClientService, Client } from './client.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>My Profile</h2>
    <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
      <label>Full Name: <input formControlName="full_name"></label><br>
      <label>Email: <input formControlName="email"></label><br>
      <label>Phone: <input formControlName="phone"></label><br>
      <label>Address: <input formControlName="address"></label><br>
      <label>ID Number: <input formControlName="idNumber"></label><br>
      <label>Status: <input formControlName="status"></label><br>
      <button type="submit" [disabled]="profileForm.invalid">Update</button>
    </form>
    <div *ngIf="successMessage" style="color: green">{{successMessage}}</div>
    <div *ngIf="errorMessage" style="color: red">{{errorMessage}}</div>
  `
})
export class ClientProfileComponent implements OnInit {
  profileForm: FormGroup;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
  ) {
    this.profileForm = this.fb.group({
      full_name: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      idNumber: ['', Validators.required],
      status: [{ value: '', disabled: true }]
    });
  }

  ngOnInit() {
    this.clientService.getMyProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue(profile);
      },
      error: () => console.log('Failed to load profile')
    });
  }

  onSubmit() {
    if (this.profileForm.invalid) return;
    const updated: Partial<Client> = this.profileForm.getRawValue();
    this.clientService.updateMyProfile(updated).subscribe({
      next: () => {
        this.successMessage = 'Profile updated!';
        this.errorMessage = '';
      },
      error: () => console.log('Failed to update profile')
    });
  }
} 