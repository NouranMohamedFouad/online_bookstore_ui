import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor() {
    this.registerForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[A-Za-z]+(?:\s[A-Za-z]+)*$/)]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.pattern('^[\\w.%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$')]),
      password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')]),
      confirmPassword: new FormControl('', [Validators.required]),
      street: new FormControl('', [Validators.minLength(3)]),
      city: new FormControl('', [Validators.pattern(/^[A-Za-z\s]+$/)]),
      buildingNo: new FormControl('', [Validators.pattern(/^\d+$/)]),
      floorNo: new FormControl('', [Validators.pattern(/^\d+$/)]),
      flatNo: new FormControl('', [Validators.pattern(/^\d+$/)]),
      phone: new FormControl('', [Validators.required, Validators.pattern('^\\+?\\d{7,15}$')]),
    }, { validators: [this.passwordMatchValidator, this.addressValidator] });
  }

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  };

  addressValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const street = control.get('street')?.value;
    const city = control.get('city')?.value;
    const buildingNo = control.get('buildingNo')?.value;
    const floorNo = control.get('floorNo')?.value;
    const flatNo = control.get('flatNo')?.value;

    if (street || city || buildingNo || floorNo || flatNo) {
      if (!street || !city || !buildingNo || !floorNo || !flatNo) {
        return { addressIncomplete: true };
      }
    }
    return null;
  };
  handleSignup() {
    if (this.registerForm.valid) {
      console.log(this.registerForm.value);
      this.registerForm.reset();
    }
  }
}
