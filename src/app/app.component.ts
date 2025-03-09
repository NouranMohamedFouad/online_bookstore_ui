import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { from } from 'rxjs';
import { HeaderComponent } from './layout/header/header.component';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
  
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'book-store-mean';
}
