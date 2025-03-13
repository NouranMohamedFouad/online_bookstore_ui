import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { BookDetailsComponent } from './pages/book-details/book-details.component';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { CartComponent } from './pages/cart/cart.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { ReviewsComponent } from './pages/reviews/reviews.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { OrderHistoryComponent } from './pages/orders/orders-history/order-history.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { AddBookComponent } from './pages/add-book/add-book.component';
import { UpdateBookComponent } from './update-book/update-book.component';
import { authGuard } from './guards/auth.guard';
import { OrderConfirmationComponent } from './pages/order-confirmation/order-confirmation.component';
import { isAdminGuard } from './guards/is-admin/is-admin.guard';
import { isLogedinGuard } from './guards/is-logedin/is-logedin.guard';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        title: 'Books Home Page'
    },
    {
        path: 'update-book/:id',
        component: UpdateBookComponent,
        title: 'Update Book',
        canActivate: [isAdminGuard]
    },
    {
        path: 'add-book',
        component: AddBookComponent,
        title: 'Add Book',
        canActivate: [isAdminGuard]
    },
    {
        path: 'book-details/:bookId',
        component: BookDetailsComponent,
        title: 'BookDetails'
    },
    {
        path: 'books/:id/reviews',
        component: ReviewsComponent,
        canActivate: [isLogedinGuard]
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
        path: 'user-profile',
        component: UserProfileComponent,
        title: 'User Profile',
        canActivate: [isLogedinGuard]
    },
    {
        path: 'cart',
        component: CartComponent,
        title: 'Cart',
        canActivate: [authGuard]
    },
    {
        path: 'payment',
        component: PaymentComponent,
        title: 'Payment',
        canActivate: [authGuard]
    },
    {
        path: 'reviews/:bookId',
        component: ReviewsComponent,
        title: 'Review',
        canActivate: [isLogedinGuard]

    },
    {
        path: 'books/:bookId',
        component: ReviewsComponent
    },
    {
        path: 'orders',
        component: OrderHistoryComponent,
        title: 'Orders History',
        canActivate: [isLogedinGuard]

    },
    {
        path: 'order-confirmation',
        component: OrderConfirmationComponent,
        title: 'Order Confirmation',
        canActivate: [isLogedinGuard]
    },
    {
        path: '**',
        component: NotfoundComponent,
        title: 'Not Found Page'
    }
];
