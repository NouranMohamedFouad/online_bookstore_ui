import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Cart } from '../../../interfaces/cart';

export interface PaymobAuthenticationResponse {
  token: string;
  profile: {
    id: number;
    user: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
      email: string;
    }
  }
}

export interface PaymobOrderResponse {
  id: number;
  created_at: string;
  delivery_needed: boolean;
  merchant: {
    id: number;
    created_at: string;
  };
  amount_cents: number;
  shipping_data: any;
  currency: string;
  is_payment_locked: boolean;
  is_return: boolean;
  is_cancel: boolean;
  is_returned: boolean;
  is_canceled: boolean;
  merchant_order_id: string;
  // other fields
}

export interface PaymobPaymentKeyResponse {
  token: string;
}

export interface PaymobCheckoutData {
  apiKey: string;
  integrationId: number;
  iframeId: string;
  paymentToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymobService {
  private backendUrl = 'http://localhost:3000';
  private paymobBaseUrl = 'https://accept.paymob.com/api';
  
  // These values would typically be retrieved from the backend
  private apiKey = ''; // We'll get this from the backend

  constructor(private http: HttpClient) {}

  /**
   * Get Paymob configuration from backend to keep keys secure
   */
  private getPaymobConfig(): Observable<{
    apiKey: string;
    integrationId: number;
    iframeId: string;
  }> {
    return this.http.get<{
      apiKey: string;
      integrationId: number;
      iframeId: string;
    }>(`${this.backendUrl}/payment/config`).pipe(
      catchError(err => {
        console.error('Error getting Paymob config:', err);
        return throwError(() => new Error('Failed to get payment configuration'));
      })
    );
  }

  /**
   * Complete Paymob payment flow
   * @param cart Cart to process payment for
   * @param billingData Customer billing information
   */
  processPayment(cart: Cart, billingData: any): Observable<PaymobCheckoutData> {
    // Step 1: Get Paymob configuration
    return this.getPaymobConfig().pipe(
      switchMap(config => {
        this.apiKey = config.apiKey;
        
        // Step 2: Authenticate with Paymob
        return this.authenticate().pipe(
          switchMap(authResponse => {
            const authToken = authResponse.token;
            
            // Step 3: Register the order
            return this.registerOrder(authToken, cart).pipe(
              switchMap(orderResponse => {
                // Step 4: Get payment key
                return this.getPaymentKey(
                  authToken, 
                  orderResponse.id, 
                  this.calculateOrderAmountCents(cart),
                  billingData
                ).pipe(
                  map(paymentKeyResponse => {
                    // Step 5: Return checkout data for iframe/redirect
                    return {
                      apiKey: this.apiKey,
                      integrationId: config.integrationId,
                      iframeId: config.iframeId,
                      paymentToken: paymentKeyResponse.token
                    };
                  })
                );
              })
            );
          })
        );
      })
    );
  }

  /**
   * Authenticate with Paymob API
   */
  private authenticate(): Observable<PaymobAuthenticationResponse> {
    return this.http.post<PaymobAuthenticationResponse>(
      `${this.paymobBaseUrl}/auth/tokens`, 
      { api_key: this.apiKey }
    ).pipe(
      catchError(err => {
        console.error('Paymob authentication error:', err);
        return throwError(() => new Error('Payment authentication failed'));
      })
    );
  }

  /**
   * Register order with Paymob
   * @param authToken Authentication token
   * @param cart Cart data
   */
  private registerOrder(authToken: string, cart: Cart): Observable<PaymobOrderResponse> {
    const orderItems = cart.items.map(item => ({
      name: item.book?.title || 'Book',
      amount_cents: Math.round(item.price * 100) * item.quantity,
      description: item.book?.description || 'Book purchase',
      quantity: item.quantity
    }));

    const orderData = {
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: this.calculateOrderAmountCents(cart),
      currency: "EGP",
      items: orderItems
    };

    return this.http.post<PaymobOrderResponse>(
      `${this.paymobBaseUrl}/ecommerce/orders`, 
      orderData
    ).pipe(
      catchError(err => {
        console.error('Paymob order registration error:', err);
        return throwError(() => new Error('Failed to register order with payment provider'));
      })
    );
  }

  /**
   * Get payment key from Paymob
   * @param authToken Authentication token
   * @param orderId Paymob order ID
   * @param amountCents Order amount in cents
   * @param billingData Customer billing information
   */
  private getPaymentKey(
    authToken: string, 
    orderId: number, 
    amountCents: number,
    billingData: any
  ): Observable<PaymobPaymentKeyResponse> {
    const paymentKeyRequest = {
      auth_token: authToken,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: orderId,
      billing_data: {
        apartment: "NA",
        email: billingData.email,
        floor: "NA",
        first_name: billingData.firstName,
        street: billingData.address,
        building: "NA",
        phone_number: billingData.phone,
        shipping_method: "NA",
        postal_code: billingData.zipCode,
        city: billingData.city,
        country: "NA",
        state: billingData.state,
        last_name: billingData.lastName,
      },
      currency: "EGP",
      integration_id: billingData.integrationId
    };

    return this.http.post<PaymobPaymentKeyResponse>(
      `${this.paymobBaseUrl}/acceptance/payment_keys`,
      paymentKeyRequest
    ).pipe(
      catchError(err => {
        console.error('Paymob payment key error:', err);
        return throwError(() => new Error('Failed to generate payment key'));
      })
    );
  }

  /**
   * Calculate order amount in cents
   * @param cart Cart to calculate amount for
   */
  private calculateOrderAmountCents(cart: Cart): number {
    // Calculate subtotal
    const subtotal = cart.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0);
    
    // Add tax (8%)
    const tax = subtotal * 0.08;
    
    // Add shipping (free over $50)
    const shipping = subtotal > 50 ? 0 : 5.99;
    
    // Calculate total and convert to cents
    const total = (subtotal + tax + shipping) * 100;
    
    // Return as rounded integer
    return Math.round(total);
  }
} 