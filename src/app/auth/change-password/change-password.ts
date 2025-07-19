import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        RouterModule,
        NzFormModule,
        NzInputModule,
        NzButtonModule,
        NzIconModule,
        CommonModule
    ],
    templateUrl: './change-password.html',
    styleUrl: './change-password.css'
})
export class ChangePassword {
    changePasswordForm: FormGroup;
    errorMessage: string = '';
    loading = false;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private authService: AuthService,
        private message: NzMessageService
    ) {
        this.changePasswordForm = this.fb.group({
            currentPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: passwordMatchValidator });
    }

    onSubmit(): void {
        if (this.changePasswordForm.invalid) {
            this.changePasswordForm.markAllAsTouched();
            return;
        }
        this.loading = true;
        this.errorMessage = '';

        // For now, we'll just redirect to the appropriate dashboard
        // In a real implementation, you would call an API to change the password
        this.loading = false;
        this.message.success('Password changed successfully!');

        // Redirect based on user role
        const role = this.authService.getRole();
        if (role === 'SUPER_ADMIN') {
            this.router.navigate(['/dashboard/super-admin']);
        } else if (role === 'AGENT') {
            this.router.navigate(['/dashboard/agent']);
        } else if (role === 'CLIENT') {
            this.router.navigate(['/dashboard/client']);
        } else {
            this.router.navigate(['/welcome']);
        }
    }
} 