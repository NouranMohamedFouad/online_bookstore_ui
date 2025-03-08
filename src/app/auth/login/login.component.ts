import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  constructor() {
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
    this.isSubmitting = true;

    if (this.loginForm.valid) {
      console.log('Form valid!', this.loginForm.value);
      // Here you would typically call your auth service
      // to handle the login process

      this.isSubmitting = false;
    } else {
      this.loginForm.markAllAsTouched();
      this.isSubmitting = false;
    }
  }
}
