import { HttpInterceptorFn } from '@angular/common/http';

//INTERCEPTOR: captura y reconoce TODAS y cada una de las solicitudes HTTP q el usuario haga, para poder agregar el AccessToken en los Headers (encabezados de autorización) q van a ser enviadas al servidor
export const AuthInterceptor: HttpInterceptorFn = (request, next) => {
  const accessToken = sessionStorage.getItem('accessToken');
  
    const newRequest = request.clone({
    withCredentials: true,
    setHeaders: accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {}
  });

  return next(newRequest);
};