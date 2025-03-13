import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container my-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow">
            <div class="card-body text-center p-5">
              <div *ngIf="loading" class="mb-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Processing your payment results...</p>
              </div>
              
              <div *ngIf="!loading && success" class="text-center">
                <i class="bi bi-check-circle-fill text-success" style="font-size: 5rem;"></i>
                <h2 class="mt-4 mb-3">Payment Successful!</h2>
                <p class="mb-4">Your order has been placed successfully.</p>
                <p>Order ID: <strong>{{ orderId }}</strong></p>
                <p>Transaction ID: <strong>{{ transactionId }}</strong></p>
                
                <button class="btn btn-primary mt-4" (click)="goToOrders()">
                  View My Orders
                </button>
              </div>
              
              <div *ngIf="!loading && !success" class="text-center">
                <i class="bi bi-x-circle-fill text-danger" style="font-size: 5rem;"></i>
                <h2 class="mt-4 mb-3">Payment Failed</h2>
                <p class="mb-4">{{ errorMessage || 'There was an issue processing your payment.' }}</p>
                
                <button class="btn btn-primary mt-2" (click)="retry()">
                  Try Again
                </button>
                <button class="btn btn-outline-secondary mt-2 ms-2" (click)="goToCart()">
                  Return to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bi-check-circle-fill {
      color: #28a745;
    }
    .bi-x-circle-fill {
      color: #dc3545;
    }
  `]
})
export class PaymentCallbackComponent implements OnInit {
  loading: boolean = true;
  success: boolean = false;
  errorMessage: string | null = null;
  orderId: string = '';
  transactionId: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}
  
  ngOnInit(): void {
    // Extract query parameters from the URL
    this.route.queryParams.subscribe(params => {
      // Process based on Paymob callback parameters
      if (params['success'] === 'true') {
        this.success = true;
        this.orderId = params['order'] || 'Unknown';
        this.transactionId = params['id'] || 'Unknown';
        
        // Notify backend about successful payment
        this.notifyBackend(params);
      } else {
        this.success = false;
        this.errorMessage = params['error_message'] || 'Payment was not successful';
      }
      
      this.loading = false;
    });
  }
  
  notifyBackend(params: any): void {
    // Send payment result to backend
    this.http.post('http://localhost:3000/payment/callback', params)
      .subscribe({
        next: (response) => {
          console.log('Backend notified about payment:', response);
        },
        error: (error) => {
          console.error('Error notifying backend:', error);
        }
      });
  }
  
  goToOrders(): void {
    this.router.navigate(['/orders']);
  }
  
  goToCart(): void {
    this.router.navigate(['/cart']);
  }
  
  retry(): void {
    this.router.navigate(['/payment']);
  }
} 