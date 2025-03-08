import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { BookDetailsComponent } from './pages/book-details/book-details.component';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { CartComponent } from './pages/cart/cart.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { ReviewsComponent } from './pages/reviews/reviews.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        title: 'Books Home Page'
    },
    {
        path: 'book-details',
        component:BookDetailsComponent,
        title: 'BookDetails'
    },
     { path: 'books/:id/reviews', component: ReviewsComponent },
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
        path: 'user-profile',
        component: UserProfileComponent,
        title: 'User Profile'
    },
    {
        path: 'cart',
        component: CartComponent,
        title: 'Cart'
    },
    {
        path: 'payment',
        component: PaymentComponent,
        title: 'Payment'
    },
    {
        path: 'review',
        component: ReviewsComponent,
        title: 'Review'
    },
    {
        path: 'orders',
        component: OrderHistoryComponent,
        title: 'Orders History'
    },
    {
        path: '**',
        component: NotfoundComponent,
        title: 'Not Found Page'
    }
];
