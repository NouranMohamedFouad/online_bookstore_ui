import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartRequestsService } from '../../services/requests/cart/cart-requests.service';
import { Cart, CartItem } from '../../interfaces/cart';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../auth/login/login.service';
import { jwtDecode } from 'jwt-decode';
import { catchError, of } from 'rxjs';


interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = true;
  error: string | null = null;
  userId: string | null = null;

  constructor(
    private cartService: CartRequestsService,
    private router: Router,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    // Check if user is authenticated before loading cart
    if (!this.loginService.isAuthenticated()) {
      console.error('User is not authenticated, redirecting to login');
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: '/cart',
          errorMsg: 'Please log in to view your cart'
        }
      });
      return;
    }

    // Get userId from token
    this.getUserIdFromToken();

    console.log('User is authenticated with ID:', this.userId);
    this.loadCart();
  }

  // Extract user ID from the JWT token
  getUserIdFromToken(): void {
    const token = this.loginService.getToken();
    if (!token) {
      console.error('No token available');
      this.error = 'Authentication error: No token available';
      return;
    }

    try {
      // Decode JWT token to extract user ID
      const decoded = jwtDecode<JwtPayload>(token);
      this.userId = decoded.id;
      console.log('User ID from token:', this.userId);
    } catch (error) {
      console.error('Error decoding token:', error);
      this.error = 'Authentication error: Could not decode token';
    }
  }

  loadCart(): void {
    this.loading = true;
    this.cartService.getCart()
      .pipe(
        catchError(err => {
          console.error('Error in cart component loading cart:', err);
          if (err.status === 401 || err.status === 403) {
            this.router.navigate(['/login'], {
              queryParams: {
                returnUrl: '/cart',
                errorMsg: err.status === 401
                  ? 'Your session has expired. Please log in again.'
                  : 'You don\'t have permission to access this cart.'
              }
            });
          } else {
            this.error = err.error?.message || 'Failed to load cart';
          }
          this.loading = false;
          return of(null);
        })
      )
      .subscribe(cart => {
        if (cart) {
          console.log('Cart loaded successfully:', cart);

          // Ensure cart has the correct user ID if it's missing
          if (cart && !cart.userId && this.userId) {
            cart.userId = this.userId;
          }

          this.cart = cart;
          this.loading = false;
        }
      });
  }

  updateQuantity(bookId: string, quantity: number): void {
    if (quantity < 1) return;

    this.loading = true;
    console.log(`Updating quantity for book ${bookId} to ${quantity}`);
    this.cartService.updateQuantity(bookId, quantity)
      .pipe(
        catchError(err => {
          console.error('Error updating quantity:', err);
          this.error = err.error?.message || 'Failed to update quantity';
          this.loading = false;
          this.loadCart(); // Reload cart to ensure consistency
          return of(null);
        })
      )
      .subscribe(updatedCart => {
        if (updatedCart) {
          console.log('Quantity updated successfully:', updatedCart);
          this.cart = updatedCart;
          this.loading = false;
        }
      });
  }

  removeItem(bookId: string): void {
    this.loading = true;
    console.log(`Removing book ${bookId} from cart`);
    this.cartService.removeFromCart(bookId)
      .pipe(
        catchError(err => {
          console.error('Error removing item:', err);
          this.error = err.error?.message || 'Failed to remove item';
          this.loading = false;
          this.loadCart();
          return of(null);
        })
      )
      .subscribe(result => {
        console.log('Item removed successfully');
        this.loadCart();
      });
  }

  checkout(): void {
    // Navigate to checkout/order page
    this.router.navigate(['/orders/new']);
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }
}
