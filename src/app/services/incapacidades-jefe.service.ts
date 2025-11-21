import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitudIncapacidadJefe, RespuestaSolicitudIncapacidad } from '../models/solicitud-incapacidad-jefe';

@Injectable({
  providedIn: 'root'
})
export class IncapacidadesJefeService {
  private apiUrl = 'https://www.evensoft21.com/managehr/api/public/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token')!;
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // Obtener todas las solicitudes de incapacidades pendientes para el jefe de personal
  obtenerSolicitudesIncapacidades(): Observable<SolicitudIncapacidadJefe[]> {
    return this.http.get<SolicitudIncapacidadJefe[]>(
      `${this.apiUrl}/solicitudes-incapacidades-jefe`,
      { headers: this.getHeaders() }
    );
  }

  // Obtener una solicitud específica
  obtenerSolicitud(id: number): Observable<SolicitudIncapacidadJefe> {
    return this.http.get<SolicitudIncapacidadJefe>(
      `${this.apiUrl}/solicitudes-incapacidades-jefe/${id}`,
      { headers: this.getHeaders() }
    );
  }

  // Aprobar una solicitud de incapacidad
  aprobarSolicitud(respuesta: RespuestaSolicitudIncapacidad): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/solicitudes-incapacidades-jefe/${respuesta.idIncapacidad}/aprobar`,
      respuesta,
      { headers: this.getHeaders() }
    );
  }

  // Rechazar una solicitud de incapacidad
  rechazarSolicitud(respuesta: RespuestaSolicitudIncapacidad): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/solicitudes-incapacidades-jefe/${respuesta.idIncapacidad}/rechazar`,
      respuesta,
      { headers: this.getHeaders() }
    );
  }

  // Obtener estadísticas de solicitudes
  obtenerEstadisticas(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/solicitudes-incapacidades-jefe/estadisticas`,
      { headers: this.getHeaders() }
    );
  }

  // Filtrar solicitudes por estado
  filtrarPorEstado(estado: string): Observable<SolicitudIncapacidadJefe[]> {
    return this.http.get<SolicitudIncapacidadJefe[]>(
      `${this.apiUrl}/solicitudes-incapacidades-jefe?estado=${estado}`,
      { headers: this.getHeaders() }
    );
  }

  // Buscar solicitudes por empleado
  buscarPorEmpleado(termino: string): Observable<SolicitudIncapacidadJefe[]> {
    return this.http.get<SolicitudIncapacidadJefe[]>(
      `${this.apiUrl}/solicitudes-incapacidades-jefe?buscar=${termino}`,
      { headers: this.getHeaders() }
    );
  }

  actualizarEstado(id: number, estado: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/solicitudes-incapacidades-jefe/${id}/estado`,
      { estado },
      { headers: this.getHeaders() }
    );
  }
} 