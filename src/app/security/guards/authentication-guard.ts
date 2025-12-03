import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccessService } from '../../services/access-service';
import { UtilityService } from '../../services/utility-service';
import { catchError, map, of } from 'rxjs';

//GUARD: permite proteger rutas que requieren autenticación y solo permite el acceso a usuarios autenticados
export const AuthenticationGuard: CanActivateFn = (route, state) => {
  let router = inject(Router);
  let _servicioAcceso = inject(AccessService);
  let _servicioUtilidad = inject(UtilityService);

  let accessToken = sessionStorage.getItem("accessToken");

  //Determina si el usuario puede acceder a una ruta protegida
  if (accessToken) {
    return true;
  } else {
    router.navigate(["login"]);
    return false;
  }

  // //Valida la autenticidad del AccessToken (el Backend realiza la validación del AccessToken con cada petición q recibe)
  // if (accessToken) {
  //   return _servicioAcceso.ValidarToken(accessToken).pipe(
  //     map(respuesta => {
  //       if (respuesta.isSuccess) {
  //         return true;
  //       } else {
  //         router.navigate(["login"]);
  //         return false;
  //       }
  //     }),
  //     catchError(respuesta => {
  //       router.navigate(["login"]); //         'Personalizado'           'Por defecto'
  //       _servicioUtilidad.MostarAlerta(`${respuesta?.error?.mensaje} ${respuesta?.message}`, "ERROR 😢");
  //       return of(false);
  //     })
  //   )
  // } else {
  //   //Opción #1:
  //   router.navigateByUrl("login");
  //   return false;

  //   //Opción #2:
  //   // let url = router.createUrlTree(["login"]);
  //   // return url;
  // }
};