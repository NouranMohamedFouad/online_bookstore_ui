import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Book } from '../../interfaces/book';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css'],
  imports: [FormsModule, NgIf, NgFor]
})
export class ReviewsComponent implements OnInit {
  book: Book | null = null;
  reviews: any[] = [];
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
      this.fetchReviews(bookId);
    }
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found.');
      this.router.navigate(['/login']);
      return new HttpHeaders();
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  fetchBookDetails(bookId: string): void {
    this.http.get<Book>(`http://localhost:3000/books/${bookId}`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (book) => {
          this.book = book;
          console.log('Fetched Book:', book);
        },
        error: (err) => {
          console.error('Error fetching book details:', err);
        }
      });
  }

  fetchReviews(bookId: string): void {
    this.http.get<any[]>(`http://localhost:3000/reviews/book/${bookId}`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (reviews) => {
          this.reviews = reviews;
          console.log('Fetched Reviews:', reviews);
        },
        error: (err) => {
          console.error('Error fetching reviews:', err);
        }
      });
  }

  submitReview(): void {
    if (this.book) {
      const newReview = { bookId: this.book._id, rating: this.rating, comment: this.comment };

      this.http.post(`http://localhost:3000/reviews`, newReview, { headers: this.getAuthHeaders() })
        .subscribe({
          next: () => {
            console.log('Review submitted successfully');
            this.rating = 0;
            this.comment = '';
            this.fetchReviews(this.book!._id);
          },
          error: (err) => {
            console.error('Error submitting review:', err);
          }
        });
    }
  }

  editReview(review: any): void {
    this.editingReview = { ...review };
    this.rating = review.rating;
    this.comment = review.comment;
  }

  updateReview(): void {
    if (this.editingReview) {
      const updatedReview = { rating: this.rating, comment: this.comment };

      this.http.put(`http://localhost:3000/reviews/${this.editingReview._id}`, updatedReview, { headers: this.getAuthHeaders() })
        .subscribe({
          next: () => {
            console.log('Review updated successfully');
            this.editingReview = null;
            this.rating = 0;
            this.comment = '';
            this.fetchReviews(this.book!._id);
          },
          error: (err) => {
            console.error('Error updating review:', err);
          }
        });
    }
  }

  deleteReview(reviewId: string): void {
    if (confirm('Are you sure you want to delete this review?')) {
      this.http.delete(`http://localhost:3000/reviews/${reviewId}`, { headers: this.getAuthHeaders() })
        .subscribe({
          next: () => {
            console.log('Review deleted successfully');
            this.fetchReviews(this.book!._id);
          },
          error: (err) => {
            console.error('Error deleting review:', err);
          }
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/books', this.book?._id || '']);
  }
}
