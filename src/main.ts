import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { AuthInterceptor } from '../src/app/security/interceptors/authentication-interceptor';
import { ActivityInterceptor } from '../src/app/security/interceptors/activity-interceptor';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { NgIdleModule } from '@ng-idle/core';
import { MatDialogModule } from '@angular/material/dialog';
import 'zone.js';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([AuthInterceptor, ActivityInterceptor])
    ),
    importProvidersFrom(
      MatDialogModule,
      NgIdleModule.forRoot(),
      NgIdleKeepaliveModule.forRoot()
    ),
  ]
}).catch(err => console.error(err));