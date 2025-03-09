import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Book } from '../../interfaces/book';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, CommonModule } from '@angular/common';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css'],
  imports: [FormsModule, NgIf, NgFor, CommonModule],
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
    const bookId = this.route.snapshot.paramMap.get('bookId');
    console.log('Book ID from route:', bookId);

    if (bookId) {
      this.fetchBookDetails(bookId);
      this.fetchReviews(bookId);
    } else {
      console.error('Book ID is null or undefined.');
    }
  }

  fetchBookDetails(bookId: string): void {
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

  fetchReviews(bookId: string): void {
    console.log('Fetching reviews for bookId:', bookId);

    this.http.get<any[]>(`http://localhost:3000/reviews/${bookId}`).subscribe({
      next: (reviews) => {
        console.log('Fetched Reviews:', reviews);
        this.reviews = reviews;
      },
      error: (err) => {
        console.error('Error fetching reviews:', err);
      },
    });
  }

  submitReview(): void {
    if (!this.book) {
      console.error('Book is null. Cannot submit review.');
      return;
    }

    const newReview = {
      bookId: this.book._id, // Use the correct book ID
      rating: this.rating,
      comment: this.comment,
    };

    this.http.post(`http://localhost:3000/reviews`, newReview).subscribe({
      next: () => {
        console.log('Review submitted successfully');
        this.rating = 0;
        this.comment = '';
        this.fetchReviews(this.book!._id); // Refresh the reviews list
      },
      error: (err) => {
        console.error('Error submitting review:', err);
      },
    });
  }

  editReview(review: any): void {
    console.log('Editing review:', review);
    this.editingReview = { ...review };
    this.rating = review.rating;
    this.comment = review.comment;
  }

  updateReview(): void {
    if (this.editingReview) {
      const updatedReview = {
        rating: this.rating,
        comment: this.comment,
      };

      this.http
        .put(
          `http://localhost:3000/reviews/${this.editingReview._id}`,
          updatedReview
        )
        .subscribe({
          next: () => {
            console.log('Review updated successfully');
            this.editingReview = null;
            this.rating = 0;
            this.comment = '';
            this.fetchReviews(this.book!._id); // Refresh the reviews list
          },
          error: (err) => {
            console.error('Error updating review:', err);
          },
        });
    } else {
      console.error('No review is being edited.');
    }
  }

  deleteReview(reviewId: string): void {
    if (confirm('Are you sure you want to delete this review?')) {
      this.http
        .delete(`http://localhost:3000/reviews/${reviewId}`)
        .subscribe({
          next: () => {
            console.log('Review deleted successfully');
            this.fetchReviews(this.book!._id); // Refresh the reviews list
          },
          error: (err) => {
            console.error('Error deleting review:', err);
          },
        });
    }
  }

  goBack(): void {
    if (this.book && this.book._id) {
      this.router.navigate(['/book-details', this.book._id]);
    } else {
      console.error('Book ID is missing, cannot navigate back.');
    }
  }
}