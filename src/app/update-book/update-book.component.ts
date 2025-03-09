import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BooksRequestsService } from '../services/requests/books/books-requests.service';

@Component({
  selector: 'app-update-book',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './update-book.component.html',
  styleUrls: ['./update-book.component.css']
})
export class UpdateBookComponent implements OnInit {

  updateBookForm: FormGroup;
  categories = [
    'Fiction',
    'Non-fiction',
    'Science',
    'History',
    'Fantasy',
    'Biography',
    'Other'
  ];
  bookId!: number;
  bookDetails: any;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private httpRequestsService: BooksRequestsService
  ) {
    this.updateBookForm = this.fb.group({
      title: ['', [Validators.required,Validators.minLength(1)]],
      author: ['', [Validators.required,Validators.minLength(3)]],
      description: ['',Validators.required],
      price: [0, [Validators.required,Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      image: [null],
      category: ['',Validators.required]
    });
  }

  ngOnInit() {
    this.bookId = this.route.snapshot.params['id'];
    this.loadBookDetails();
  }

  loadBookDetails() {
    this.httpRequestsService.getBookById(this.bookId).subscribe((book: any) => {
      console.log(book);
      
      this.updateBookForm.patchValue({
        title: book.title,
        author: book.author,
        description: book.description,
        price: book.price,
        stock: book.stock,
        category: book.category
      });
    });
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.updateBookForm.patchValue({
        image: file
      });
    }
  }

  onSubmit() {
    if (this.updateBookForm.invalid) {
      console.error('Form is invalid');
      return;
    }

    const formData = new FormData();
    Object.keys(this.updateBookForm.controls).forEach(key => {
      const control = this.updateBookForm.get(key);
      if (control && control.value) {
        formData.append(key, control.value);
      }
    });

    this.httpRequestsService.updateBook(this.bookId, formData).subscribe(response => {
      console.log('Book updated successfully', response);
      this.router.navigate(['/']);
    }, error => {
      console.error('Error updating book', error);
    });
  }
}
