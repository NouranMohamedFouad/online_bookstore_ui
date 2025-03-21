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
  cart: Cart = {
    userId: '',
    items: [],
    total_price: 0
  };
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

    // Handle WebSocket messages if the connection is available
    try {
      if (this.websocketService.socket) {
        this.websocketService.socket.onmessage = (event) => {
          this.response = event.data;
          console.log('Payment component received WebSocket message:', event.data);
        };
      }
    } catch (error) {
      console.error('Error setting up WebSocket listener in payment component:', error);
    }
  }
  
  loadCartData(): void {
    this.loading = true;
    this.error = null;
    
    this.cartService.getCart().subscribe({
      next: (cart: Cart) => {
        console.log('Cart loaded in payment component with populated book details:', cart);
        if (cart && cart.items) {
          this.cart = cart;
        } else {
          this.error = 'Your cart appears to be empty. Please add items to your cart before proceeding to payment.';
          console.warn('Empty or invalid cart data received:', cart);
        }
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
    
    // Here you would call your payment processing API
    // For now, we'll simulate a successful payment after a delay
    setTimeout(() => {
      this.loading = false;
      
      // After successful payment, create an order
      this.createOrder();
    }, 2000);
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
      this.router.navigate(['/shopping/order-confirmation']);

    }, 2000);

    // , {
    //   queryParams: { 
    //     orderId: 'ORD-' + Math.floor(Math.random() * 1000000),
    //     paymentId: 'PAY-' + Math.floor(Math.random() * 1000000) 
    //   }
    // });
    
  }
  sendMessage() {
    if (!this.cart) {
      console.warn('Cannot send order message: Cart is empty or undefined');
      return;
    }

    const orderDetails = {
      totalPrice: this.cart.total_price,
      itemCount: this.cart.items.length,
      timestamp: new Date().toISOString()
    };
    
    try {
      const success = this.websocketService.sendMessage(JSON.stringify(orderDetails));
      if (!success) {
        console.warn('Failed to send order details via WebSocket');
      }
    } catch (error) {
      console.error('Error sending order details via WebSocket:', error);
    }
  }
  
  
  retryPayment(): void {
    this.error = null;
    this.loadCartData();
  }
  
  goBack(): void {
    this.router.navigate(['/shopping/cart']);
  }
  
  // Calculate tax (for demo purposes - 8%)
  calculateTax(): number {
    if (!this.cart || !this.cart.total_price) return 0;
    return parseFloat((this.cart.total_price * 0.08).toFixed(2));
  }
  
  // Get total with tax
  getTotal(): number {
    if (!this.cart || !this.cart.total_price) return 0;
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
