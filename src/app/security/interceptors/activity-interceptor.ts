import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { inject } from '@angular/core';
import { SessionTimeoutService } from '../../services/session-timeout-service';

let activeRequests = 0;

//INTERCEPTOR: intercepta TODAS las peticiones HTTP para pausar el temporizador de inactividad mientras haya solicitudes en curso siendo procesadas por el servidor y reanudarlo cuando las haya procesado todas
export const ActivityInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionTimeoutService = inject(SessionTimeoutService);
  activeRequests++;

  sessionTimeoutService.PauseSessionTimer();

  return next(req).pipe(
    finalize(() => {
      activeRequests--;
      if (activeRequests === 0) {
        sessionTimeoutService.ResumeSessionTimer();
      }
    })
  );
};