import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartRequestsService } from '../../services/requests/cart/cart-requests.service';
import { Cart } from '../../interfaces/cart';
import { OrdersRequestsService } from '../../services/requests/orders/orders-requests.service';
import { WebsocketService } from '../../services/requests/websocket/websocket.service';

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
  cart: Cart | null = null;
  response: string='';

  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cartService: CartRequestsService,
    private oredrsHttpRequest: OrdersRequestsService,
    private websocketService: WebsocketService,
  ) {}
  
  ngOnInit(): void {
    this.initForm();
    this.loadCartData();

    this.websocketService.socket.onmessage = (event) => {
      this.response = event.data;
    };
  }
  
  loadCartData(): void {
    this.loading = true;
    this.error = null;
    
    // First ensure there's a cart in the database
    this.cartService.ensureCartExists().subscribe({
      next: (success) => {
        if (!success) {
          this.loading = false;
          this.error = "Unable to create cart in the database. Please try again.";
          return;
        }
        
        // Now get the cart details
        this.cartService.getCart().subscribe({
          next: (cart: Cart) => {
            console.log('Cart loaded in payment component:', cart);
            this.cart = cart;
            
            // Validate cart has items before allowing checkout
            if (!cart.items || cart.items.length === 0) {
              this.error = 'Your cart is empty. Please add items to your cart before proceeding to checkout.';
              console.warn('Empty cart detected in payment page');
            }
            
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Could not load cart data. Please try again.';
            this.loading = false;
            console.error('Error loading cart:', err);
          }
        });
      },
      error: (error) => {
        console.error("Error ensuring cart exists:", error);
        this.loading = false;
        this.error = "Unable to verify your cart. Please try refreshing the page or contact support.";
      }
    });
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
    
    // Verify cart exists and has items
    if (!this.cart || !this.cart.items || this.cart.items.length === 0) {
      this.error = 'Cannot process payment: Your cart is empty. Please add items to your cart first.';
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    // Here you would call your payment processing API
    // For now, we'll simulate a successful payment after a delay
    setTimeout(() => {
      this.loading = false;
      
      // After successful payment, create an order
      this.createOrder();
    }, 2000);
  }
  
  createOrder(): void {
    if (!this.cart || !this.cart.items || this.cart.items.length === 0) {
      this.error = 'Cannot place order: Your cart is empty.';
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    // First ensure a cart record exists in the database
    // This solves the issue where userCart is null in the backend
    this.cartService.ensureCartExists().subscribe({
      next: (success) => {
        if (!success) {
          this.loading = false;
          this.error = "Unable to verify your cart in the database. Please try again.";
          return;
        }
        
        console.log("Cart verified, proceeding with order creation");
        
        // Now proceed with order creation with improved error handling
        this.oredrsHttpRequest.addOrder().subscribe({
          next: (response) => {
            console.log("Order added successfully:", response);
            this.loading = false;
            
            // Send websocket notification after successful order
            this.sendMessage();
            
            // Navigate to confirmation page
            this.router.navigate(['/order-confirmation']);
          },
          error: (err) => {
            this.loading = false;
            console.error("Error adding order:", err);
            
            // Provide user-friendly error messages based on error type
            if (err.message && typeof err.message === 'string') {
              // Use the error message from the service if available
              this.error = err.message;
            } else if (err.status === 422) {
              this.error = "There was a problem validating your order. Please check your cart and try again.";
            } else if (err.status === 401 || err.status === 403) {
              this.error = "You must be logged in to place an order. Please sign in and try again.";
              // Redirect to login
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 3000);
            } else if (err.status === 0) {
              this.error = "Network error. Please check your connection and try again.";
            } else {
              this.error = "An unexpected error occurred. Please try again later.";
            }
            
            // Automatically retry for network errors after 3 seconds
            if (err.status === 0) {
              setTimeout(() => {
                this.error = "Retrying order placement...";
                this.createOrder();
              }, 3000);
            }
          }
        });
      },
      error: (err) => {
        this.loading = false;
        console.error("Error verifying cart:", err);
        this.error = "Unable to verify your cart. Please try again later.";
      }
    });
  }
  
  sendMessage() {
    if (!this.cart) {
      console.error("Cannot send message: Cart is null");
      return;
    }

    const orderDetails = {
      totalPrice: this.cart.total_price,
    };
    const data = {
      order: orderDetails
    };
    this.websocketService.sendMessage(JSON.stringify(data));
  }
  
  
  retryPayment(): void {
    this.error = null;
    this.loadCartData();
  }
  
  goBack(): void {
    this.router.navigate(['/cart']);
  }
  
  goToCart(): void {
    this.router.navigate(['/cart']);
  }
  
  // Calculate tax (for demo purposes - 8%)
  calculateTax(): number {
    if (!this.cart) return 0;
    return parseFloat((this.cart.total_price * 0.08).toFixed(2));
  }
  
  // Get total with tax
  getTotal(): number {
    if (!this.cart) return 0;
    return parseFloat((this.cart.total_price + this.calculateTax()).toFixed(2));
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
