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

  RegistrarUsuario(usuario:Registro): Observable<RespuestaUsuario>
  {
    var respuesta = this.http.post<RespuestaUsuario>(`${this.baseUrl}RegistrarUsuario`, usuario);
    return respuesta;
  }

  LoginUsuario(usuario:Login): Observable<RespuestaUsuario>
  {
    var respuesta = this.http.post<RespuestaUsuario>(`${this.baseUrl}AutenticarUsuario`, usuario); //..., usuario, { withCredentials: true });
    return respuesta;
  }

  OlvidoSuContrasena(email:string): Observable<RespuestaUsuario>
  {
    var respuesta = this.http.post<RespuestaUsuario>(`${this.baseUrl}OlvidoSuContrasena`, { email });
    return respuesta;
  }

  ActualizarContrasenaAntigua(nuevaContrasena:RestablecimientoContrasena): Observable<RespuestaUsuario>
  {
    var respuesta = this.http.post<RespuestaUsuario>(`${this.baseUrl}ActualizarContrasenaAntigua`, nuevaContrasena);
    return respuesta;
  }

  ValidarToken(accessToken:string): Observable<RespuestaUsuario>
  {
    var respuesta = this.http.get<RespuestaUsuario>(`${this.baseUrl}ValidarToken`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }, withCredentials: true
    });
    return respuesta;
  }

  ObtenerRefreshToken(accessToken:string): Observable<RespuestaUsuario>
  {
    var respuesta = this.http.post<RespuestaUsuario>(`${this.baseUrl}ObtenerRefreshToken`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }, withCredentials: true
    });
    return respuesta;
  }

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