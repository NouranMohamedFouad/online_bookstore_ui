import { Book } from './../../interfaces/book';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { NgFor,NgIf,NgClass } from '@angular/common';


@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  imports:[NgFor,NgIf,  HttpClientModule,NgClass],
  styleUrls: ['./book-details.component.css']
})
export class BookDetailsComponent implements OnInit {

  books: Book[] = [];
  apiUrl = 'http://localhost:3000/books';
  isLoading = false;
  errorMessage: string | null = null;
 
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchBooks();
  }
  getStars(rating: number | null | undefined): number[] {
    if (rating === null || rating === undefined) {
      return Array(5).fill(0); 
    }
    return Array.from({ length: 5 }, (_, i) => (i < Math.round(rating) ? 1 : 0));
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
  

  
}
