import { HttpRequestsService } from '../../services/requests/http-requests.service';
import { Component, OnInit } from '@angular/core';
import { Book } from '../../interfaces/book';
import { CommonModule } from '@angular/common';
import { CeilPipe } from '../../pipe/ceil.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CeilPipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  books: Book[] = [];
  currentPage: number = 1;
  pageSize: number = 12;
  totalPages: number = 0;

  constructor(private httpRequestsService: HttpRequestsService) { }

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {
    this.httpRequestsService.getBooksList(this.currentPage, this.pageSize).subscribe((response: any) => {
      this.books = response.books;
      this.totalPages = response.totalPages;
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadBooks();
  }
}