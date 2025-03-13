import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './layout/header/header.component';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { FooterComponent } from "./layout/footer/footer.component";
  
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, HttpClientModule, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'book-store-mean';
}
