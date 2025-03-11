import { BooksRequestsService } from '../../services/requests/books/books-requests.service';
import { HttpRequestsService } from '../../services/requests/http-requests.service';
import { Component, OnInit } from '@angular/core';
import { Book } from '../../interfaces/book';
import { CommonModule } from '@angular/common';
import { CeilPipe } from '../../pipe/ceil.pipe';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CeilPipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  carouselImages = [
    'assets/images/th (1).jpeg',
    'assets/images/th (2).jpeg',
    'assets/images/th (3).jpeg',
    'assets/images/th (4).jpeg'
  ];
  books: Book[] = [];
  currentPage: number = 1;
  userRole!: string;
  pageSize: number = 12;
  totalPages: number = 0;

  constructor(private router: Router, private booksRequestsService: BooksRequestsService, private httpRequestsService: HttpRequestsService) { }

  ngOnInit() {
    this.loadBooks();
    this.userRole = this.httpRequestsService.getUserData().role;

  }

  loadBooks() {
    this.booksRequestsService.getBooksList(this.currentPage, this.pageSize).subscribe((response: any) => {
      this.books = response.books;
      this.totalPages = response.totalPages;
      console.log(this.books);
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadBooks();
  }

  deleteBook(id: number) {
    this.booksRequestsService.deleteBook(id).subscribe(response => {
      console.log('Book deleted successfully', response);
      this.loadBooks();
    });
  }

  addBook() {
    this.router.navigate(['/add-book']);
  }

  updateBook(id: number) {
    this.router.navigate(['/update-book', id]);
  }

  deleteAllBooks() {
    this.booksRequestsService.deleteAllBooks().subscribe(response => {
      console.log('All books deleted successfully', response);
      this.loadBooks();
    });
  }

  viewBookDetails(id: number) {
    this.router.navigate(['/book-details', id]);
  }

  onSearch(data: string) {
    this.booksRequestsService.getBooksList(this.currentPage, this.pageSize, data).subscribe((response: any) => {
      this.books = response.books;
      this.totalPages = response.totalPages;
      console.log(this.books);
    });
  }
}