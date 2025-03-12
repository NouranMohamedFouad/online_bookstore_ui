import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Book } from '../../interfaces/book';
import { NgIf } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CartRequestsService } from '../../services/requests/cart/cart-requests.service';
import { LoginService } from '../../auth/login/login.service';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.css'],
  imports: [NgIf],
  standalone: true
})
export class BookDetailsComponent implements OnInit {
  book: Book | null = null; // Single book
  apiUrl = ''; // API URL

  isLoading = false;
  errorMessage: string | null = null;
  addingToCart = false;
  processingBookId: string | null = null; // Track which book is being added

  constructor(
    private http: HttpClient, 
    private router: Router,
    private route: ActivatedRoute, // Inject ActivatedRoute
    private cartService: CartRequestsService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    const bookId = Number(this.route.snapshot.paramMap.get('bookId'));
    console.log('Book ID from route:', bookId); // Debugging
    if (bookId) {
      this.apiUrl = `http://localhost:3000/books?bookId=${bookId}`; // Set apiUrl dynamically
      this.fetchBooks(bookId);
      console.log(this.apiUrl);
    } else {
      console.error('Book ID is missing from the route.');
    }
  }

  fetchBooks(bookId: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.http.get<{ books: Book[] }>(`http://localhost:3000/books?bookId=${bookId}`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching book details:', error);
          this.errorMessage = 'Failed to fetch book details. Please try again later.';
          return of({ books: [] }); // Return an empty array of books
        })
      )
      .subscribe({
        next: (response) => {
          console.log('API Response:', response); // Debugging
          if (response.books.length === 0) {
            console.error('No book data returned from API.');
            return;
          }

          // Find the book with the matching bookId
          const foundBook = response.books.find((book) => book.bookId === bookId);
          if (foundBook) {
            this.book = foundBook;
            console.log('Book assigned:', this.book); // Debugging
          } else {
            console.error('No matching book found for the given bookId.');
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching book details:', err);
          this.isLoading = false;
        },
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