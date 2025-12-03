import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../settings/appsettings';
import { Registro } from '../interfaces/Registro';
import { Login } from '../interfaces/Login';
import { RestablecimientoContrasena } from '../interfaces/RestablecimientoContrasena';
import { RespuestaUsuario } from '../interfaces/RespuestaUsuario';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccessService {
  private http = inject(HttpClient);
  private baseUrl: string = appsettings.apiURL + "Usuario/";

  constructor() { }

  //Registra un nuevo usuario en el sistema
  RegistrarUsuario(usuario:Registro): Observable<RespuestaUsuario>
  {
    var respuesta = this.http.post<RespuestaUsuario>(`${this.baseUrl}RegistrarUsuario`, usuario);
    return respuesta;
  }

  //Autentica y autoriza el acceso del usuario en la aplicación
  LoginUsuario(usuario:Login): Observable<RespuestaUsuario>
  {
    var respuesta = this.http.post<RespuestaUsuario>(`${this.baseUrl}AutenticarUsuario`, usuario); //..., usuario, { withCredentials: true });
    return respuesta;
  }

  //Resetea la contraseña del usuario y envía un correo de restablecimiento de contraseña
  OlvidoSuContrasena(email:string): Observable<RespuestaUsuario>
  {
    var respuesta = this.http.post<RespuestaUsuario>(`${this.baseUrl}OlvidoSuContrasena`, { email });
    return respuesta;
  }

  //Actualiza la contraseña antigua de la cual no se acuerda el usuario
  RestablecerContrasena(nuevaContrasena:RestablecimientoContrasena): Observable<RespuestaUsuario>
  {
    var respuesta = this.http.post<RespuestaUsuario>(`${this.baseUrl}RestablecerContrasena`, nuevaContrasena);
    return respuesta;
  }

  //Genera tanto un AccessToken como un RefreshToken
  ObtenerRefreshToken(accessToken:string): Observable<RespuestaUsuario>
  {
    var respuesta = this.http.post<RespuestaUsuario>(`${this.baseUrl}ObtenerRefreshToken`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }, withCredentials: true
    });
    return respuesta;
  }

  //Cierra la sesión del usuario en la aplicación
  CerrarSesion(accessToken:string): Observable<RespuestaUsuario>
  {
    var respuesta = this.http.post<RespuestaUsuario>(`${this.baseUrl}CerrarSesion`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }, withCredentials: true
    });
    return respuesta;
  }

  //solo para PRUEBAS (Nunca para PRODUCCIÓN)
  Ping(accessToken:string): Observable<RespuestaUsuario>
  {
    var respuesta = this.http.get<RespuestaUsuario>(`${this.baseUrl}Ping`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }, withCredentials: true
    });
    return respuesta;
  }

}