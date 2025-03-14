import { Routes } from '@angular/router';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { authGuard } from './guards/auth.guard';
import { isAdminGuard } from './guards/is-admin/is-admin.guard';
import { isLogedinGuard } from './guards/is-logedin/is-logedin.guard';

export const routes: Routes = [
    // Auth routes
    {
        path: 'auth',
        children: [
            {
                path: 'login',
                loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
                title: 'Login'
            },
            {
                path: 'register',
                loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent),
                title: 'Register'
            }
        ]
    },

    // Book management routes
    {
        path: 'books',
        children: [
            {
                path: 'add',
                loadComponent: () => import('./pages/add-book/add-book.component').then(m => m.AddBookComponent),
                canActivate: [isAdminGuard],
                title: 'Add Book'
            },
            {
                path: 'update/:id',
                loadComponent: () => import('./update-book/update-book.component').then(m => m.UpdateBookComponent),
                canActivate: [isAdminGuard],
                title: 'Update Book'
            },
            {
                path: ':id/reviews',
                loadComponent: () => import('./pages/reviews/reviews.component').then(m => m.ReviewsComponent),
                canActivate: [isLogedinGuard]
            },
            {
                path: ':bookId',
                loadComponent: () => import('./pages/reviews/reviews.component').then(m => m.ReviewsComponent)
            }
        ]
    },

    // Book details route
    {
        path: 'book-details/:bookId',
        loadComponent: () => import('./pages/book-details/book-details.component').then(m => m.BookDetailsComponent),
        title: 'Book Details'
    },

    // Reviews route
    {
        path: 'reviews/:bookId',
        loadComponent: () => import('./pages/reviews/reviews.component').then(m => m.ReviewsComponent),
        canActivate: [isLogedinGuard],
        title: 'Review'
    },

    // User profile route
    {
        path: 'user-profile',
        loadComponent: () => import('./pages/user-profile/user-profile.component').then(m => m.UserProfileComponent),
        canActivate: [isLogedinGuard],
        title: 'User Profile'
    },

    // Shopping related routes
    {
        path: 'shopping',
        children: [
            {
                path: 'cart',
                loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent),
                canActivate: [authGuard],
                title: 'Cart'
            },
            {
                path: 'payment',
                loadComponent: () => import('./pages/payment/payment.component').then(m => m.PaymentComponent),
                canActivate: [authGuard],
                title: 'Payment'
            },
            {
                path: 'orders',
                loadComponent: () => import('./pages/orders/orders-history/order-history.component').then(m => m.OrderHistoryComponent),
                canActivate: [isLogedinGuard],
                title: 'Orders History'
            },
            {
                path: 'order-confirmation',
                loadComponent: () => import('./pages/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent),
                canActivate: [isLogedinGuard],
                title: 'Order Confirmation'
            }
        ]
    },

    // Home page
    {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
        title: 'Books Home Page'
    },

    // Not found page
    {
        path: '**',
        component: NotfoundComponent,
        title: 'Not Found Page'
    }
];
