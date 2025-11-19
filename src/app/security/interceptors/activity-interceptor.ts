import { HttpInterceptorFn } from '@angular/common/http';

export const activityInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
