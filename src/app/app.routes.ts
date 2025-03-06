import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { BookDetailsComponent } from './pages/book-details/book-details.component';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { CartComponent } from './pages/cart/cart.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { ReviewsComponent } from './pages/reviews/reviews.component';

export const routes: Routes = [
    {
        path: '', 
        component: HomeComponent,
        title: 'Books Home Page'
    },
    {
        path: 'book-details',
        component:BookDetailsComponent,
        title: 'Book Details'
    },
    {
        path: 'register',
        component: RegisterComponent,
        title: 'Register'
    },
    {
        path: 'login',
        component: LoginComponent,
        title: 'Login'
    },
    {
        path: 'cart',
        component: CartComponent,
        title: 'Cart'
    },
    {
        path: 'review',
        component: ReviewsComponent,
        title: 'Review'
    },
    {
        path: '**',
        component: NotfoundComponent,
        title: 'Not Found Page'
    }
];
