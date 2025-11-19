import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './security/interceptors/authentication-interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), //permite cambiar de una pantalla a otra
    provideHttpClient(withInterceptors([AuthInterceptor])) //se pueden tener varios Interceptores (el orden en el q se declaran es el orden en el q se ejecutan)
  ]
};