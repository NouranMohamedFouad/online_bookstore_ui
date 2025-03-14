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
    {
      heading: "Unlock Your Next Adventure",
      text :'Dive into worlds unknown and let stories ignite your imagination',
      image :'assets/images/th (5).jpeg'
    },
    {
      heading: "Explore, Dream, Read!",
      text :'Handpicked books to take you on unforgettable journeys.',
      image :'assets/images/th (6).jpeg'
    },
    {
      heading: "Turn the Page, Begin the Magic",
      text :' Every book holds a secret—are you ready to discover it?',
      image :'assets/images/th (7).jpeg'
    },
    {
      heading: "Featured Books",
      text :' Curated stories to inspire and captivate.',
      image :'assets/images/th (8).jpeg'
    },
    {
      heading: "Your Next Favorite Book Awaits!",
      text :'Discover hidden gems and timeless classics today.',
      image :'assets/images/th (9).jpeg'
    }
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
    this.router.navigate(['/books/add']);
  }

  updateBook(id: number) {
    this.router.navigate(['/books/update', id]);
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