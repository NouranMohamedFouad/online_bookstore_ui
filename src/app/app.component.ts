import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { BookDetailsComponent } from './pages/book-details/book-details.component';
import { HttpClientModule } from '@angular/common/http';
import { from } from 'rxjs';
import { HeaderComponent } from './layout/header/header.component';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { AddBookComponent } from "./add-book/add-book.component";
  
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, HttpClientModule, AddBookComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'book-store-mean';
}
