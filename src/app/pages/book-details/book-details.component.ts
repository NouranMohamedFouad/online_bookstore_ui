import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Book } from '../../interfaces/book';
import { NgIf } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CartRequestsService } from '../../services/requests/cart/cart-requests.service';
import { LoginService } from '../../auth/login/login.service';
import { BooksRequestsService } from '../../services/requests/books/books-requests.service';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.css'],
  imports: [NgIf],
  standalone: true
})
export class BookDetailsComponent implements OnInit {
  book: Book | null = null; // Initialize as null
  apiUrl = ''; // API URL

  isLoading = false; // Loading state
  errorMessage: string | null = null; // Error message
  addingToCart = false; // Adding to cart state
  processingBookId: string | null = null; // Track which book is being added

  constructor(
    private http: HttpClient,
    private bookService: BooksRequestsService, 
    private router: Router,
    private route: ActivatedRoute, // Inject ActivatedRoute
    private cartService: CartRequestsService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    const bookId = Number(this.route.snapshot.paramMap.get('bookId'));
    console.log('Book ID from route:', bookId); // Debugging
    if (bookId) {
      this.apiUrl = `https://4fb48a73561160ae9baeeba2bb5a7a82.serveo.net/books?bookId=${bookId}`; // Set apiUrl dynamically
      this.fetchBooks(bookId);
      console.log(this.apiUrl);
    } else {
      console.error('Book ID is missing from the route.');
      this.errorMessage = 'Book ID is missing from the route.';
    }
  }

  fetchBooks(bookId: number): void {
    this.isLoading = true; // Set loading to true
    this.errorMessage = null; // Reset error message

    this.bookService.getBookById(bookId).subscribe({
      next: (book: Book) => {
        this.book = book; // Set book data
        this.isLoading = false; // Set loading to false
      },
      error: (err) => {
        console.error('Error fetching book:', err);
        this.errorMessage = 'Failed to fetch book details. Please try again later.'; // Set error message
        this.isLoading = false; // Set loading to false
      }
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

    if (!isAuthenticated || !hasStock || !isNotBeingAdded) {
      console.log(`Button disabled for ${book.title}: 
        ${!isAuthenticated ? 'User not authenticated' : 
         !hasStock ? 'No stock available' : 
         'Currently being added to cart'}`);
      return false;
    }
    return true;
  }

  addToCart(bookId: string): void {
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
        alert('Book added to cart successfully!');
      },
      error: (err) => {
        this.addingToCart = false;
        this.processingBookId = null;
        console.error('Error adding to cart:', err);

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