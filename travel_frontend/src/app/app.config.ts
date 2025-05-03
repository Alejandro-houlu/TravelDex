import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { rootReducer } from './store';
import { JWT_OPTIONS, JwtHelperService} from '@auth0/angular-jwt';
import { JwtInterceptor } from './jwt.interceptor';

export function tokenGetter() {
  return localStorage.getItem('access');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes,withHashLocation()),
    provideHttpClient(withInterceptorsFromDi()),
    provideStore(rootReducer),

    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },

    // Manual JWT helper service providers
    {
      provide: JWT_OPTIONS,
      useValue: {
        tokenGetter,
      },
    },
    JwtHelperService,
  
  ],
  
};
