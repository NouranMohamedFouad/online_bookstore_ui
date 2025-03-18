import { ApplicationConfig, provideZoneChangeDetection, NgZone } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { routes } from './app.routes';
import { AuthInterceptor } from './auth/http-interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    // Explicitly provide NgZone to ensure it uses the global Zone
    {
      provide: NgZone,
      useFactory: () => new NgZone({ enableLongStackTrace: false })
    }
  ],
};
