import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoginService } from './login.service';
import { LoginRequest } from '../../interfaces/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(private loginService: LoginService, private router: Router) {
    // Redirect if already logged in
    if (this.loginService.isAuthenticated()) {
      this.router.navigate(['/']);
    }

    this.loginForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.pattern('^[\\w.%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$'),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      rememberMe: new FormControl(false),
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  handleLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const loginData: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      rememberMe: this.loginForm.value.rememberMe,
    };

    this.loginService.login(loginData).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        // Navigate to home page or intended destination
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage =
          error.message || 'Login failed. Please check your credentials.';
      },
    });
  }
}
