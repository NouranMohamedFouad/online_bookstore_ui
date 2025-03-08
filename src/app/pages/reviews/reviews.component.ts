import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { Book } from '../../interfaces/book';
import { FormsModule } from '@angular/forms';
import { NgIf,NgFor } from '@angular/common';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css'],
  imports:[FormsModule,NgIf,HttpClientModule,NgFor]
})
export class ReviewsComponent implements OnInit {
  book: Book | null = null;
  editingReview: any = null;
  rating: number = 0;
  comment: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.fetchBookDetails(bookId);
    }
  }

  fetchBookDetails(bookId: string): void {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found. Please log in.');
      this.router.navigate(['/login']); // Redirect to login page
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<Book>(`http://localhost:3000/books/${bookId}`, { headers })
      .subscribe({
        next: (book) => {
          this.book = book;
        },
        error: (err) => {
          console.error('Error fetching book details:', err);
          if (err.status === 401) {
            this.router.navigate(['/login']); // Redirect to login page if unauthorized
          }
        }
      });
  }

  submitReview(): void {
    if (this.book) {
      const newReview = { rating: this.rating, comment: this.comment };
      this.book.reviews = this.book.reviews || [];
      this.book.reviews.push(newReview);

    
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No authentication token found. Please log in.');
        this.router.navigate(['/login']); 
        return;
      }

      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);


      this.http.put(`http://localhost:3000/books/${this.book.id}`, this.book, { headers })
        .subscribe({
          next: () => {
            this.rating = 0;
            this.comment = '';
          },
          error: (err) => {
            console.error('Error submitting review:', err);
            if (err.status === 401) {
              this.router.navigate(['/login']); 
            }
          }
        });
    }
  }

  editReview(review: any): void {
    this.editingReview = review;
    this.rating = review.rating;
    this.comment = review.comment;
  }

  deleteReview(review: any): void {
    if (this.book) {
      this.book.reviews = this.book.reviews.filter((r: any) => r !== review);

      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No authentication token found. Please log in.');
        this.router.navigate(['/login']); 
        return;
      }

      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.put(`http://localhost:3000/books/${this.book.id}`, this.book, { headers })
        .subscribe({
          error: (err) => {
            console.error('Error deleting review:', err);
            if (err.status === 401) {
              this.router.navigate(['/login']); // Redirect to login page if unauthorized
            }
          }
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/books', this.book?.id]);
  }
}