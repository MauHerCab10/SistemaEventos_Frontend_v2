import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../settings/appsettings';
import { Observable } from 'rxjs';

import { ResponseApi } from '../interfaces/Response-Api';
import { Evento } from '../interfaces/Evento';

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private http = inject(HttpClient);
  private baseUrl: string = appsettings.apiURL + "Evento/";

  constructor() { }

  //Retorna todos los eventos existentes en la plataforma (si el usuario la creó, entonces la podrá modificar o eliminar, si no, entonces se podrá inscribir o salir de uno)
  ConsultarEventosDisponibles(idUsuario: string): Observable<ResponseApi>
  {
    var respuesta = this.http.get<ResponseApi>(`${this.baseUrl}ConsultarEventosDisponibles?idUsuario=${idUsuario}`);
    return respuesta;
  }

  //Permite crear un nuevo evento en la aplicación
  CrearEvento(request:Evento):Observable<ResponseApi>{
    var respuesta = this.http.post<ResponseApi>(`${this.baseUrl}CrearEvento`, request);
    return respuesta
  }

  //Permite modificar un evento existente en la aplicación
  EditarEvento(request:Evento):Observable<ResponseApi>{
    var respuesta = this.http.put<ResponseApi>(`${this.baseUrl}ModificarEvento`, request);
    return respuesta;
  }

  //Permite eliminar un evento existente en la aplicación
  EliminarEvento(idEvento:number):Observable<ResponseApi>{
    var respuesta = this.http.delete<ResponseApi>(`${this.baseUrl}EliminarEvento?idEvento=${idEvento}`);
    return respuesta;
  }

  //Permite inscribir a un usuario diferente al q creó el evento
  InscripcionAEvento(idEvento: number, idUsuario: number): Observable<ResponseApi> {
    let url = `${this.baseUrl}InscripcionAEvento?idEvento=${idEvento}&idUsuario=${idUsuario}`;
    return this.http.post<ResponseApi>(url, null);
  }

  //Permite que un usuario inscrito en un evento pueda abandonarlo
  DimisionDeEvento(idEvento: number, idUsuario: number): Observable<ResponseApi> {
    let url = `${this.baseUrl}DimisionDeEvento?idEvento=${idEvento}&idUsuario=${idUsuario}`;
    return this.http.post<ResponseApi>(url, null);
  }

}
