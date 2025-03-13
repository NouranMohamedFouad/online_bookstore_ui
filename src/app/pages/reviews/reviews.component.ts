import { HttpRequestsService } from './../../services/requests/http-requests.service';
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
  standalone: true
})
export class ReviewsComponent implements OnInit {
  @Input() book!: Book;
  reviews: any[] = [];
  rating: number = 0;
  comment: string = '';


  // Add review form data
  addRating: number = 0;
  addComment: string = '';

  // Edit review form data
  editRating: number = 0;
  editComment: string = '';
  editingReview: any = null; // Tracks the review being edited

  //userId: string | null = localStorage.getItem('userId'); // Logged-in user ID
  userId: string | null = null;

  constructor(private http: HttpClient, private route: ActivatedRoute, private httpRequestsService:  HttpRequestsService) {}

  ngOnInit(): void {
    this.userId = this.httpRequestsService.getUserData().userId;
    console.log('User ID from AuthService:', this.userId);

    const bookId = Number(this.route.snapshot.paramMap.get('bookId'));
    console.log('Book ID from route:', bookId);

    if (bookId) {
      this.fetchBookDetails(bookId);
      this.fetchReviews(bookId);
    } else {
      console.error('Book ID is null or undefined.');
    }
  }

  // Fetch book details from the API
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

  // Fetch reviews for the current book
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

  // Submit a new review
  submitReview(): void {
    if (!this.book?.bookId) {
      console.error('Book ID is missing');
      return;
    }

    const newReview = {
      rating: this.addRating,
      comment: this.addComment,
      userId: this.userId,
      bookId: this.book.bookId, // Include bookId
    };

    this.http.post(`http://localhost:3000/reviews?&bookId=3`, newReview).subscribe({
      next: () => {
        console.log('Review added successfully');
        this.resetAddForm(); // Reset the add review form
        this.fetchReviews(this.book.bookId); // Refresh the reviews list
      },
      error: (err) => {
        console.error('Error adding review:', err);
      },
    });
  }

  // Populate the edit form with the selected review's data
  editReview(review: any): void {
    this.editingReview = { ...review };
    this.editRating = review.rating;
    this.editComment = review.comment;
    console.log('Editing Review:', this.editingReview); // Log the review being edited
  }

  // Update an existing review
  updateReview(): void {
    if (!this.editingReview) {
      console.error('No review is being edited.');
      return;
    }

    const updatedReview = {
      rating: this.editRating,
      comment: this.editComment,
    };

    console.log('Updated Review Data:', updatedReview); // Log the updated data

    this.http.patch(`http://localhost:3000/reviews/${this.editingReview.reviewId}`, updatedReview).subscribe({
      next: () => {
        console.log('Review updated successfully');
        this.cancelEditing(); // Reset the edit review form
        this.fetchReviews(this.book.bookId); // Refresh the reviews list
      },
      error: (err) => {
        console.error('Error updating review:', err);
      },
    });
  }

  // Delete a review
  deleteReview(reviewId: string): void {
    this.http.delete(`http://localhost:3000/reviews/${reviewId}`).subscribe({
      next: () => {
        console.log('Review deleted successfully');
        this.fetchReviews(this.book.bookId); // Refresh the reviews list
      },
      error: (err) => {
        console.error('Error deleting review:', err);
      },
    });
  }

  // Check if the review belongs to the current user
  isUserReview(review: any): boolean {
    return this.userId === review.userId;
  }

  // Cancel the edit mode and reset the edit form
  cancelEditing(): void {
    this.editingReview = null;
    this.editRating = 0;
    this.editComment = '';
  }

  // Reset the add review form
  resetAddForm(): void {
    this.addRating = 0;
    this.addComment = '';
  }
}
