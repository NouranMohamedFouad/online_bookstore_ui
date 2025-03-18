import { HttpRequestsService } from './../../services/requests/http-requests.service';
import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Book } from '../../interfaces/book';
import { BooksRequestsService } from '../../services/requests/books/books-requests.service';

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

  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    private httpRequestsService: HttpRequestsService,
    private booksRequestsService: BooksRequestsService) { }

  ngOnInit(): void {
    console.log(this.httpRequestsService.getUserData());

    this.userId = this.httpRequestsService.getUserData()._id;
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
    this.booksRequestsService.getBookById(bookId).subscribe({
      next: (response) => {
        this.book = response;
        console.log('Book assigned:', this.book);
      },
      error: (err) => {
        console.error('Error fetching book details:', err);
      }
    });
  }

  // Fetch reviews for the current book
  fetchReviews(bookId: number): void {
    console.log('Fetching reviews for bookId:', bookId);

    this.http.get<{ reviews: any[] }>(`https://api.testdomainnamefortestingmydevtesting.mom/reviews?bookId=${bookId}`).subscribe({
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

    this.http.post(`https://api.testdomainnamefortestingmydevtesting.mom/reviews?bookId=${this.book.bookId}`, newReview).subscribe({
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

    this.http.patch(`https://api.testdomainnamefortestingmydevtesting.mom/reviews/${this.editingReview.reviewId}`, updatedReview).subscribe({
      next: () => {
        console.log('Review updated successfully');
        this.cancelEditing(); 
        this.fetchReviews(this.book.bookId); // Refresh the reviews list
      },
      error: (err) => {
        console.error('Error updating review:', err);
      },
    });
  }

  deleteReview(reviewId: string): void {
    this.http.delete(`https://api.testdomainnamefortestingmydevtesting.mom/reviews/${reviewId}`).subscribe({
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
    this.editRating = 0;
    this.editComment = '';
  }

  resetAddForm(): void {
    this.addRating = 0;
    this.addComment = '';
  }
}
