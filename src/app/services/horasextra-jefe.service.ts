import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitudHorasExtraJefe, RespuestaSolicitudHorasExtra } from '../models/solicitud-horasextra-jefe';

@Injectable({
  providedIn: 'root'
})
export class HorasExtraJefeService {
  private apiUrl = 'https://www.evensoft21.com/managehr/api/public/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token')!;
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  obtenerSolicitudesHorasExtra(): Observable<SolicitudHorasExtraJefe[]> {
    return this.http.get<SolicitudHorasExtraJefe[]>(
      `${this.apiUrl}/solicitudes-horasextra-jefe`,
      { headers: this.getHeaders() }
    );
  }

  obtenerSolicitud(id: number): Observable<SolicitudHorasExtraJefe> {
    return this.http.get<SolicitudHorasExtraJefe>(
      `${this.apiUrl}/solicitudes-horasextra-jefe/${id}`,
      { headers: this.getHeaders() }
    );
  }

  aprobarSolicitud(respuesta: RespuestaSolicitudHorasExtra): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/solicitudes-horasextra-jefe/${respuesta.idHorasExtra}/aprobar`,
      respuesta,
      { headers: this.getHeaders() }
    );
  }

  rechazarSolicitud(respuesta: RespuestaSolicitudHorasExtra): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/solicitudes-horasextra-jefe/${respuesta.idHorasExtra}/rechazar`,
      respuesta,
      { headers: this.getHeaders() }
    );
  }

  obtenerEstadisticas(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/solicitudes-horasextra-jefe/estadisticas`,
      { headers: this.getHeaders() }
    );
  }

  filtrarPorEstado(estado: string): Observable<SolicitudHorasExtraJefe[]> {
    return this.http.get<SolicitudHorasExtraJefe[]>(
      `${this.apiUrl}/solicitudes-horasextra-jefe?estado=${estado}`,
      { headers: this.getHeaders() }
    );
  }

  buscarPorEmpleado(termino: string): Observable<SolicitudHorasExtraJefe[]> {
    return this.http.get<SolicitudHorasExtraJefe[]>(
      `${this.apiUrl}/solicitudes-horasextra-jefe?buscar=${termino}`,
      { headers: this.getHeaders() }
    );
  }

  actualizarEstado(id: number, estado: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/solicitudes-horasextra-jefe/${id}/estado`,
      { estado },
      { headers: this.getHeaders() }
    );
  }
} 