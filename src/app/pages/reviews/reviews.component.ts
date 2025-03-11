import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Book } from '../../interfaces/book';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css'],
  imports: [NgIf, NgFor, FormsModule],
})
export class ReviewsComponent implements OnInit {
  @Input() book!: Book;
  reviews: any[] = [];
  rating: number = 0;
  comment: string = '';
  editingReview: any = null;
  userId: string | null = localStorage.getItem('userId');

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const bookId = Number(this.route.snapshot.paramMap.get('bookId'));
    console.log('Book ID from route:', bookId);

    if (bookId) {
      this.fetchBookDetails(bookId);
      this.fetchReviews(bookId);
    } else {
      console.error('Book ID is null or undefined.');
    }
  }

  fetchBookDetails(bookId: number): void {
    console.log('Fetching book details for bookId:', bookId);

    this.http.get<Book>(`http://localhost:3000/books/${bookId}`).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        if (!response) {
          console.error('No book data returned from API.');
          return;
        }
        this.book = response;
        console.log('Book assigned:', this.book);
      },
      error: (err) => {
        console.error('Error fetching book details:', err);
      },
    });
  }

  fetchReviews(bookId: number): void {
    console.log('Fetching reviews for bookId:', bookId);

    this.http.get<{ reviews: any[] }>(`http://localhost:3000/reviews?bookId=${bookId}`).subscribe({
      next: (response) => {
        console.log('Fetched Reviews:', response);
        this.reviews = response.reviews || [];
      },
      error: (err) => {
        console.error('Error fetching reviews:', err);
      },
    });
  }

  submitReview(): void {
    if (!this.book?.bookId) {
      console.error('Book ID is missing');
      return;
    }

    const newReview = {
      rating: this.rating,
      comment: this.comment,
      userId: this.userId,
    };

    this.http.post(`http://localhost:3000/reviews?bookId=${this.book.bookId}`, newReview).subscribe({
      next: () => {
        console.log('Review added successfully');
        this.resetForm();
        this.fetchReviews(this.book.bookId);
      },
      error: (err) => {
        console.error('Error adding review:', err);
      },
    });
  }

  editReview(review: any): void {
    this.editingReview = { ...review };
    this.rating = review.rating;
    this.comment = review.comment;
  }

  updateReview(): void {
    if (!this.editingReview) {
      console.error('No review is being edited.');
      return;
    }

    const updatedReview = {
      rating: this.rating,
      comment: this.comment,
    };

    this.http.patch(`http://localhost:3000/reviews/${this.editingReview._id}`, updatedReview).subscribe({
      next: () => {
        console.log('Review updated successfully');
        this.cancelEditing();
        this.fetchReviews(this.book.bookId);
      },
      error: (err) => {
        console.error('Error updating review:', err);
      },
    });
  }

  deleteReview(reviewId: string): void {
    this.http.delete(`http://localhost:3000/reviews/${reviewId}`).subscribe({
      next: () => {
        console.log('Review deleted successfully');
        this.fetchReviews(this.book.bookId);
      },
      error: (err) => {
        console.error('Error deleting review:', err);
      },
    });
  }

  isUserReview(review: any): boolean {
    return this.userId === review.userId;
  }

  cancelEditing(): void {
    this.editingReview = null;
    this.resetForm();
  }

  resetForm(): void {
    this.rating = 0;
    this.comment = '';
  }
}