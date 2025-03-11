import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginService } from './login.service';
import { LoginRequest } from '../../interfaces/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  isSubmitting: boolean = false;
  returnUrl: string = '/';

  constructor(
    private loginService: LoginService, 
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.pattern('^[\\w.%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$'),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/
        ),
      ]),
      rememberMe: new FormControl(false),
    });
  }

  ngOnInit(): void {
    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Check for error message passed in the URL
    const errorMsg = this.route.snapshot.queryParams['errorMsg'];
    if (errorMsg) {
      this.errorMessage = errorMsg;
    }
    
    // Redirect if already logged in
    if (this.loginService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
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
        console.log('Login successful', response);
        // Navigate to the return URL or home page
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage =
          error.message || 'Login failed. Please check your credentials.';
        console.error('Login error:', error);
      },
    });
  }
}
