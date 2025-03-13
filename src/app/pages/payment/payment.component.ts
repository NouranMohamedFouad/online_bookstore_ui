import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartRequestsService } from '../../services/requests/cart/cart-requests.service';
import { Cart } from '../../interfaces/cart';
import { OrdersRequestsService } from '../../services/requests/orders/orders-requests.service';
import { WebsocketService } from '../../services/requests/websocket/websocket.service';
import { RouterLink } from '@angular/router';
import { PaymobService } from '../../services/requests/payment/paymob.service';
import { LoginService } from '../../auth/login/login.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit, OnDestroy {
  paymentForm!: FormGroup;
  loading: boolean = false;
  error: string | null = null;
  selectedCardType: string = 'visa';
  cart: Cart | null = null;
  response: string = '';
  isSubmitting: boolean = false;
  showCartPreview: boolean = false;
  taxRate: number = 0.08; // 8% tax rate
  
  // Paymob iframe
  paymobIframeLoaded: boolean = false;
  paymobIframeUrl: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cartService: CartRequestsService,
    private ordersHttpRequest: OrdersRequestsService,
    private websocketService: WebsocketService,
    private paymobService: PaymobService,
    private loginService: LoginService
  ) {}
  
  ngOnInit(): void {
    this.initForm();
    this.loadCheckoutData();

    this.websocketService.socket.onmessage = (event) => {
      this.response = event.data;
    };
    
    // Check if user is logged in
    if (!this.loginService.isAuthenticated()) {
      console.error('User not authenticated in payment component');
      this.error = 'Please log in to proceed with payment';
      // We'll let the auth guard handle the redirection
    }
  }
  
  loadCheckoutData(): void {
    this.loading = true;
    this.error = null;
    
    // First check if user is authenticated
    if (!this.loginService.isAuthenticated()) {
      this.error = 'You need to be logged in to access this page';
      this.loading = false;
      return;
    }
    
    this.cartService.getCart().subscribe({
      next: (cart: Cart) => {
        console.log('Cart loaded in payment component with populated book details:', cart);
        this.cart = cart;
        this.loading = false;
        
        // Make sure cart has items
        if (!cart || !cart.items || cart.items.length === 0) {
          this.error = 'Your cart is empty. Please add items before proceeding to payment.';
        }
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
      paypalEmail: ['', [Validators.email]]
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
    
    if (!this.cart) {
      this.error = 'No cart data available. Please try again.';
      this.isSubmitting = false;
      return;
    }
    
    // Create default billing data since we removed the form
    const defaultBillingData = {
      firstName: 'Customer',
      lastName: 'User',
      email: 'customer@example.com',
      phone: '1234567890',
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      integrationId: 3965743
    };
    
    // Process payment using Paymob with default billing data
    this.paymobService.processPayment(this.cart, {
      ...this.paymentForm.value,
      ...defaultBillingData
    })
      .subscribe({
        next: (checkoutData) => {
          console.log('Payment process initiated:', checkoutData);
          
          // Create the iframe URL for Paymob
          this.paymobIframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${checkoutData.iframeId}?payment_token=${checkoutData.paymentToken}`;
          
          // Create iframe element and load it
          this.loadPaymobIframe(this.paymobIframeUrl);
          
          // After successful payment initiation, create the order
          this.createOrder();
        },
        error: (err) => {
          console.error('Error processing payment:', err);
          this.error = err.message || 'Payment processing failed. Please try again.';
          this.isSubmitting = false;
        }
      });
  }
  
  loadPaymobIframe(iframeUrl: string): void {
    // Create iframe element
    const iframe = document.createElement('iframe');
    iframe.src = iframeUrl;
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    
    // Add event listener for iframe load
    iframe.onload = () => {
      this.paymobIframeLoaded = true;
      this.isSubmitting = false;
    };
    
    // Add iframe to the DOM
    const container = document.getElementById('paymob-iframe-container');
    if (container) {
      // Clear any existing content
      container.innerHTML = '';
      container.appendChild(iframe);
    }
  }
  
  processPayment(): void {
    this.submitPayment();
  }
  
  createOrder(): void {
    this.ordersHttpRequest.addOrder().subscribe(
      response => {
        console.log("Order added successfully:", response);
      },
      error => {
        console.error("Error adding order:", error);
      }
    ); 
    setTimeout(() => {
      this.sendMessage();
    }, 2000);
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
