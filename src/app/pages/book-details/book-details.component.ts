import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Book } from '../../interfaces/book';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.css'],
  imports: [NgIf, NgFor, HttpClientModule, FormsModule]
})
export class BookDetailsComponent implements OnInit {
  books: Book[] = [];
  apiUrl = 'http://localhost:3000/books';
  isLoading = false;
  errorMessage: string | null = null;
  selectedBook: Book | null = null;

  constructor(private http: HttpClient, private router: Router) {}

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
        this.isLoading = false;
      });
  }

  navigateToReviews(book: Book): void {
    this.router.navigate(['/books', book._id, 'reviews']); 
  }
}