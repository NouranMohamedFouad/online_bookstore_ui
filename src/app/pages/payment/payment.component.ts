import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  paymentForm!: FormGroup;
  loading: boolean = false;
  error: string | null = null;
  selectedCardType: string = 'visa';
  
  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.initForm();
    // You might want to get cart totals from a service here
  }
  
  initForm(): void {
    this.paymentForm = this.fb.group({
      cardNumber: ['', [
        Validators.required, 
        Validators.pattern(/^[0-9]{16}$/)
      ]],
      cardHolderName: ['', Validators.required],
      expiryDate: ['', [
        Validators.required, 
        Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
      ]],
      cvv: ['', [
        Validators.required, 
        Validators.pattern(/^[0-9]{3,4}$/)
      ]],
      sameAsShipping: [true],
      streetAddress: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      country: ['']
    });
    
    // Add conditional validators when sameAsShipping changes
    this.paymentForm.get('sameAsShipping')?.valueChanges.subscribe(sameAddress => {
      const addressControls = ['streetAddress', 'city', 'state', 'zipCode', 'country'];
      
      if (!sameAddress) {
        addressControls.forEach(control => {
          this.paymentForm.get(control)?.setValidators([Validators.required]);
        });
      } else {
        addressControls.forEach(control => {
          this.paymentForm.get(control)?.clearValidators();
        });
      }
      
      // Update validity
      addressControls.forEach(control => {
        this.paymentForm.get(control)?.updateValueAndValidity();
      });
    });
  }
  
  selectCardType(type: string): void {
    this.selectedCardType = type;
  }
  
  processPayment(): void {
    if (this.paymentForm.invalid) {
      this.markFormGroupTouched(this.paymentForm);
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    // Simulate payment processing
    setTimeout(() => {
      this.loading = false;
      
      // Successful payment
      this.router.navigate(['/confirmation']);
      
      // Or simulate an error:
      // this.error = 'Payment could not be processed. Please try again.';
    }, 2000);
  }
  
  retryPayment(): void {
    this.error = null;
    this.processPayment();
  }
  
  goBack(): void {
    this.router.navigate(['/cart']);
  }
  
  // Helper method to mark all form controls as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
