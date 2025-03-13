import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartRequestsService } from '../../services/requests/cart/cart-requests.service';
import { Cart, CartItem } from '../../interfaces/cart';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../auth/login/login.service';
import { jwtDecode } from 'jwt-decode';
import { catchError, of } from 'rxjs';
import { RouterLink } from '@angular/router';


interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  cartItems: CartItem[] = [];
  loading = true;
  error: string | null = null;
  userId: string | null = null;
  taxRate = 0.08; // 8% tax rate

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
    this.fetchCartItems();
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

  fetchCartItems(): void {
    this.loading = true;
    this.error = null;
    
    // Store bookIds of items currently being updated
    const updatingItems = this.cartItems
      .filter(item => item.updating)
      .map(item => ({
        bookId: item.bookId,
        updating: true
      }));
      
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
          this.cartItems = cart.items || [];
          
          // Restore the updating flags for items being modified
          if (updatingItems.length > 0) {
            updatingItems.forEach(updatingItem => {
              const itemIndex = this.cartItems.findIndex(item => item.bookId === updatingItem.bookId);
              if (itemIndex !== -1) {
                this.cartItems[itemIndex].updating = true;
              }
            });
          }
          
          this.loading = false;
        }
      });
  }

  loadCart(): void {
    this.fetchCartItems();
  }

  updateQuantity(bookId: string, quantity: number): void {
    // Ensure quantity is a valid number
    quantity = parseInt(String(quantity), 10);
    
    if (isNaN(quantity) || quantity < 1) {
      console.error('Invalid quantity value:', quantity);
      // Reload the cart to restore the correct quantity
      this.fetchCartItems();
      return;
    }
    
    // Find the item being updated
    const itemIndex = this.cartItems.findIndex(item => item.bookId === bookId);
    if (itemIndex === -1) {
      console.error('Item not found in cart:', bookId);
      return;
    }
    
    // Mark this specific item as updating
    this.cartItems[itemIndex].updating = true;
    
    console.log(`Updating quantity for book ${bookId} to ${quantity}`);
    this.cartService.updateQuantity(bookId, quantity)
      .pipe(
        catchError(err => {
          console.error('Error updating quantity:', err);
          this.error = err.error?.message || 'Failed to update quantity';
          
          // Remove updating flag
          if (itemIndex !== -1) {
            this.cartItems[itemIndex].updating = false;
          }
          
          return of(null);
        })
      )
      .subscribe(updatedCart => {
        if (updatedCart) {
          console.log('Quantity updated successfully:', updatedCart);
          this.cart = updatedCart;
          this.cartItems = updatedCart.items || [];
        } else {
          // If no response, make sure to remove updating flag
          if (itemIndex !== -1 && this.cartItems[itemIndex]) {
            this.cartItems[itemIndex].updating = false;
          }
        }
      });
  }

  removeItem(bookId: string): void {
    console.log(`Removing book ${bookId} from cart`);
    
    // Find the item's index and mark it as updating
    const itemIndex = this.cartItems.findIndex(item => item.bookId === bookId);
    if (itemIndex === -1) {
      console.error('Item not found in cart:', bookId);
      return;
    }
    
    // Mark this specific item as updating
    this.cartItems[itemIndex].updating = true;
    
    this.cartService.removeFromCart(bookId)
      .pipe(
        catchError(err => {
          console.error('Error removing item:', err);
          this.error = err.error?.message || 'Failed to remove item';
          
          // Remove updating flag if the item still exists
          if (itemIndex !== -1 && this.cartItems[itemIndex]) {
            this.cartItems[itemIndex].updating = false;
          }
          
          return of(null);
        })
      )
      .subscribe(result => {
        console.log('Item removed successfully');
        this.fetchCartItems();
      });
  }

  getSubtotal(): number {
    if (!this.cart || !this.cartItems.length) return 0;
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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

  proceedToCheckout(): void {
    // Navigate to payment page
    this.router.navigate(['/payment']);
  }

  checkout(): void {
    this.proceedToCheckout();
  }

  continueShopping(): void {
    this.router.navigate(['/books']);
  }
}
