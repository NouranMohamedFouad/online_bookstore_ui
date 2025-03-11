import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Book } from '../../interfaces/book';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartRequestsService } from '../../services/requests/cart/cart-requests.service';
import { LoginService } from '../../auth/login/login.service';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.css'],
  imports: [NgIf, NgFor, HttpClientModule, FormsModule],
  standalone: true
})
export class BookDetailsComponent implements OnInit {
  books: Book[] = [];
  apiUrl = 'http://localhost:3000/books';
  isLoading = false;
  errorMessage: string | null = null;
  selectedBook: Book | null = null;
  addingToCart = false;
  processingBookId: string | null = null; // Track which book is being added

  constructor(
    private http: HttpClient, 
    private router: Router,
    private cartService: CartRequestsService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.fetchBooks();
  }

  fetchBooks(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.http.get<{ books: Book[] }>(this.apiUrl)
      .pipe(
        catchError(error => {
          console.error('Error fetching books:', error);
          this.errorMessage = 'Failed to fetch books. Please try again later.';
          return of({ books: [] });
        })
      )
      .subscribe(response => {
        this.books = response.books;
        console.log('Books loaded:', this.books.length);
        // Log stock values to debug
        this.books.forEach(book => {
          console.log(`Book: ${book.title}, Stock: ${book.stock}, ID: ${book._id}`);
        });
        this.isLoading = false;
      });
  }

  navigateToReviews(bookId: number): void {
    this.router.navigate(['/reviews', bookId]);
  }

  isBookBeingAdded(bookId: string): boolean {
    return this.addingToCart && this.processingBookId === bookId;
  }

  canAddToCart(book: Book): boolean {
    const isAuthenticated = this.loginService.isAuthenticated();
    const hasStock = book.stock > 0;
    const isNotBeingAdded = !this.isBookBeingAdded(book._id);
    
    // Log the reason if the button should be disabled
    if (!isAuthenticated) {
      console.log(`Button disabled for ${book.title}: User not authenticated`);
    } else if (!hasStock) {
      console.log(`Button disabled for ${book.title}: No stock available`);
    } else if (!isNotBeingAdded) {
      console.log(`Button disabled for ${book.title}: Currently being added to cart`);
    }
    
    return isAuthenticated && hasStock && isNotBeingAdded;
  }

  addToCart(bookId: string): void {
    // Check if user is authenticated
    if (!this.loginService.isAuthenticated()) {
      console.log('User not authenticated, redirecting to login');
      this.router.navigate(['/login'], { 
        queryParams: { 
          returnUrl: this.router.url,
          errorMsg: 'Please log in to add items to your cart' 
        } 
      });
      return;
    }
    
    this.addingToCart = true;
    this.processingBookId = bookId;
    console.log(`Adding book ${bookId} to cart`);
    
    this.cartService.addToCart(bookId).subscribe({
      next: () => {
        this.addingToCart = false;
        this.processingBookId = null;
        // Show success message or navigate to cart
        alert('Book added to cart successfully!');
      },
      error: (err) => {
        this.addingToCart = false;
        this.processingBookId = null;
        console.error('Error adding to cart:', err);
        
        // Handle authentication errors
        if (err.status === 401) {
          this.router.navigate(['/login'], { 
            queryParams: { 
              returnUrl: this.router.url,
              errorMsg: 'Your session has expired. Please log in again.' 
            } 
          });
        } else {
          alert(err.error?.message || 'Failed to add book to cart. Please try again.');
        }
      }
    });
  }
}
