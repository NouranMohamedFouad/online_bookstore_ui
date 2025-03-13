import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BooksRequestsService } from '../../services/requests/books/books-requests.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule], // Import ReactiveFormsModule and CommonModule
  templateUrl: './add-book.component.html',
  styleUrls: ['./add-book.component.css']
})
export class AddBookComponent {
  addBookForm: FormGroup;
  categories = [
    'Fiction',
    'Non-fiction',
    'Science',
    'History',
    'Fantasy',
    'Biography',
    'Other'
  ];

  constructor(private router: Router, private fb: FormBuilder, private httpRequestsService: BooksRequestsService) {
    this.addBookForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      author: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      image: [null, [Validators.required]],
      category: ['', Validators.required]
    });
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.addBookForm.patchValue({
        image: file
      });
    }
  }

  onSubmit() {
    if (this.addBookForm.invalid) {
      console.error('Form is invalid');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.addBookForm.get('title')?.value);
    formData.append('author', this.addBookForm.get('author')?.value);
    formData.append('description', this.addBookForm.get('description')?.value);
    formData.append('price', this.addBookForm.get('price')?.value);
    formData.append('stock', this.addBookForm.get('stock')?.value);
    formData.append('image', this.addBookForm.get('image')?.value);
    formData.append('category', this.addBookForm.get('category')?.value);

    this.httpRequestsService.addBook(formData).subscribe(response => {
      console.log('Book added successfully', response);
    }, error => {
      console.error('Error adding book', error);
    });
    this.router.navigate(['/'])
  }
}