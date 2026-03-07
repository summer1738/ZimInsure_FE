import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClientService, Client } from './client.service';
import { CommonModule } from '@angular/common';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-profile.component.html',
  styleUrl: './client-profile.component.css'
})
export class ClientProfileComponent implements OnInit {
  profileForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private message: NzMessageService
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
      error: () => this.message.error('Failed to load profile')
    });
  }

  onSubmit() {
    if (this.profileForm.invalid) return;
    const updated: Partial<Client> = this.profileForm.getRawValue();
    this.clientService.updateMyProfile(updated).subscribe({
      next: () => this.message.success('Profile updated successfully'),
      error: () => this.message.error('Failed to update profile')
    });
  }
} 