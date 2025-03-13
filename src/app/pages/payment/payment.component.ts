import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartRequestsService } from '../../services/requests/cart/cart-requests.service';
import { Cart } from '../../interfaces/cart';
import { OrdersRequestsService } from '../../services/requests/orders/orders-requests.service';
import { WebsocketService } from '../../services/requests/websocket/websocket.service';
import { RouterLink } from '@angular/router';

interface StateOption {
  code: string;
  name: string;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  paymentForm!: FormGroup;
  loading: boolean = false;
  error: string | null = null;
  selectedCardType: string = 'visa';
  cart: Cart | null = null;
  response: string = '';
  isSubmitting: boolean = false;
  showCartPreview: boolean = false;
  taxRate: number = 0.08; // 8% tax rate
  
  // US States for dropdown
  states: StateOption[] = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cartService: CartRequestsService,
    private oredrsHttpRequest: OrdersRequestsService,
    private websocketService: WebsocketService,
  ) {}
  
  ngOnInit(): void {
    this.initForm();
    this.loadCheckoutData();

    this.websocketService.socket.onmessage = (event) => {
      this.response = event.data;
    };
  }
  
  loadCheckoutData(): void {
    this.loading = true;
    this.error = null;
    
    this.cartService.getCart().subscribe({
      next: (cart: Cart) => {
        console.log('Cart loaded in payment component with populated book details:', cart);
        this.cart = cart;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Could not load cart data. Please try again.';
        this.loading = false;
        console.error('Error loading cart:', err);
      }
    });
  }
  
  initForm(): void {
    this.paymentForm = this.fb.group({
      // Payment method
      paymentMethod: ['credit', Validators.required],
      
      // Credit card details
      cardType: ['visa', Validators.required],
      cardName: ['', Validators.required],
      cardNumber: ['', [
        Validators.required, 
        Validators.pattern(/^[0-9]{16}$/)
      ]],
      expirationDate: ['', [
        Validators.required, 
        Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
      ]],
      cvv: ['', [
        Validators.required, 
        Validators.pattern(/^[0-9]{3,4}$/)
      ]],
      
      // PayPal info
      paypalEmail: ['', [Validators.email]],
      
      // Billing address
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]]
    });
    
    // Add conditional validators based on payment method
    this.paymentForm.get('paymentMethod')?.valueChanges.subscribe(method => {
      if (method === 'credit') {
        this.paymentForm.get('cardType')?.setValidators([Validators.required]);
        this.paymentForm.get('cardName')?.setValidators([Validators.required]);
        this.paymentForm.get('cardNumber')?.setValidators([
          Validators.required, 
          Validators.pattern(/^[0-9]{16}$/)
        ]);
        this.paymentForm.get('expirationDate')?.setValidators([
          Validators.required, 
          Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
        ]);
        this.paymentForm.get('cvv')?.setValidators([
          Validators.required, 
          Validators.pattern(/^[0-9]{3,4}$/)
        ]);
        this.paymentForm.get('paypalEmail')?.clearValidators();
      } else if (method === 'paypal') {
        this.paymentForm.get('cardType')?.clearValidators();
        this.paymentForm.get('cardName')?.clearValidators();
        this.paymentForm.get('cardNumber')?.clearValidators();
        this.paymentForm.get('expirationDate')?.clearValidators();
        this.paymentForm.get('cvv')?.clearValidators();
        this.paymentForm.get('paypalEmail')?.setValidators([Validators.required, Validators.email]);
      }
      
      // Update validity
      this.paymentForm.get('cardType')?.updateValueAndValidity();
      this.paymentForm.get('cardName')?.updateValueAndValidity();
      this.paymentForm.get('cardNumber')?.updateValueAndValidity();
      this.paymentForm.get('expirationDate')?.updateValueAndValidity();
      this.paymentForm.get('cvv')?.updateValueAndValidity();
      this.paymentForm.get('paypalEmail')?.updateValueAndValidity();
    });
  }
  
  // Convenience getters for form fields
  get paymentMethod() { return this.paymentForm.get('paymentMethod')!; }
  get cardType() { return this.paymentForm.get('cardType')!; }
  get cardName() { return this.paymentForm.get('cardName')!; }
  get cardNumber() { return this.paymentForm.get('cardNumber')!; }
  get expirationDate() { return this.paymentForm.get('expirationDate')!; }
  get cvv() { return this.paymentForm.get('cvv')!; }
  get paypalEmail() { return this.paymentForm.get('paypalEmail')!; }
  get firstName() { return this.paymentForm.get('firstName')!; }
  get lastName() { return this.paymentForm.get('lastName')!; }
  get address() { return this.paymentForm.get('address')!; }
  get city() { return this.paymentForm.get('city')!; }
  get state() { return this.paymentForm.get('state')!; }
  get zipCode() { return this.paymentForm.get('zipCode')!; }
  get phone() { return this.paymentForm.get('phone')!; }
  get email() { return this.paymentForm.get('email')!; }
  
  selectPaymentMethod(method: string): void {
    this.paymentForm.get('paymentMethod')?.setValue(method);
  }
  
  selectCardType(type: string): void {
    this.selectedCardType = type;
    this.paymentForm.get('cardType')?.setValue(type);
  }
  
  toggleCartPreview(): void {
    this.showCartPreview = !this.showCartPreview;
  }
  
  getSubtotal(): number {
    if (!this.cart || !this.cart.items || this.cart.items.length === 0) return 0;
    return this.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getShippingCost(): number {
    const subtotal = this.getSubtotal();
    // Free shipping for orders over $50
    return subtotal > 50 ? 0 : 5.99;
  }

  getTaxAmount(): number {
    return this.getSubtotal() * this.taxRate;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShippingCost() + this.getTaxAmount();
  }
  
  submitPayment(): void {
    if (this.paymentForm.invalid) {
      this.markFormGroupTouched(this.paymentForm);
      return;
    }
    
    this.isSubmitting = true;
    this.error = null;
    
    // Here you would call your payment processing API
    // For now, we'll simulate a successful payment after a delay
    setTimeout(() => {
      this.isSubmitting = false;
      
      // After successful payment, create an order
      this.createOrder();
    }, 2000);
  }
  
  processPayment(): void {
    this.submitPayment();
  }
  
  createOrder(): void {
    this.oredrsHttpRequest.addOrder().subscribe(
      response => {
        console.log("Order added successfully :", response);
      },
      error => {
        console.error("Error adding order:", error);
      }
    ); 
    setTimeout(() => {
      this.sendMessage();
    }, 2000);

    this.router.navigate(['/order-confirmation']);
    // , {
    //   queryParams: { 
    //     orderId: 'ORD-' + Math.floor(Math.random() * 1000000),
    //     paymentId: 'PAY-' + Math.floor(Math.random() * 1000000) 
    //   }
    // });
    
  }
  
  sendMessage() {
    const orderDetails = {
      totalPrice: this.cart?.total_price,
    };
    const data = {
      order: orderDetails
    };
    this.websocketService.sendMessage(JSON.stringify(data));
  }
  
  retryPayment(): void {
    this.error = null;
    this.loadCheckoutData();
  }
  
  goBack(): void {
    this.router.navigate(['/cart']);
  }
  
  // Legacy methods kept for backward compatibility
  calculateTax(): number {
    return this.getTaxAmount();
  }

  ngOnDestroy() {
    this.websocketService.closeConnection();
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
