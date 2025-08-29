import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    CommonModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm: FormGroup;
  errorMessage: string = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    const { email, password } = this.loginForm.value;
    console.log('Login form values:', this.loginForm.value);
    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.loading = false;
        if ((res as any).passwordChangeRequired) {
          console.log('You must change your password before proceeding.');
          this.router.navigate(['/change-password']); // Implement this route/page
          return;
        }
        // Redirect based on role
        if (res.role === 'SUPER_ADMIN') {
          this.router.navigate(['/dashboard/super-admin']);
        } else if (res.role === 'AGENT') {
          this.router.navigate(['/dashboard/agent']);
        } else if (res.role === 'CLIENT') {
          this.router.navigate(['/dashboard/client']);
        } else {
          this.router.navigate(['/welcome']);
        }
      },
      error: () => console.log('Login failed. Please check your credentials.')
    });
  }
}
