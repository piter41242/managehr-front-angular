import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitudVacacionesJefe, RespuestaSolicitud } from '../models/solicitud-vacaciones-jefe';

@Injectable({
  providedIn: 'root'
})
export class VacacionesJefeService {
  private apiUrl = 'https://www.evensoft21.com/managehr/api/public/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token')!;
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // Obtener todas las solicitudes de vacaciones pendientes para el jefe de personal
  obtenerSolicitudesVacaciones(): Observable<SolicitudVacacionesJefe[]> {
    return this.http.get<SolicitudVacacionesJefe[]>(
      `${this.apiUrl}/solicitudes-vacaciones-jefe`,
      { headers: this.getHeaders() }
    );
  }

  // Obtener una solicitud específica
  obtenerSolicitud(id: number): Observable<SolicitudVacacionesJefe> {
    return this.http.get<SolicitudVacacionesJefe>(
      `${this.apiUrl}/solicitudes-vacaciones-jefe/${id}`,
      { headers: this.getHeaders() }
    );
  }

  // Aprobar una solicitud de vacaciones
  aprobarSolicitud(respuesta: RespuestaSolicitud): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/solicitudes-vacaciones-jefe/${respuesta.idVacaciones}/aprobar`,
      respuesta,
      { headers: this.getHeaders() }
    );
  }

  // Rechazar una solicitud de vacaciones
  rechazarSolicitud(respuesta: RespuestaSolicitud): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/solicitudes-vacaciones-jefe/${respuesta.idVacaciones}/rechazar`,
      respuesta,
      { headers: this.getHeaders() }
    );
  }

  // Obtener estadísticas de solicitudes
  obtenerEstadisticas(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/solicitudes-vacaciones-jefe/estadisticas`,
      { headers: this.getHeaders() }
    );
  }

  // Filtrar solicitudes por estado
  filtrarPorEstado(estado: string): Observable<SolicitudVacacionesJefe[]> {
    return this.http.get<SolicitudVacacionesJefe[]>(
      `${this.apiUrl}/solicitudes-vacaciones-jefe?estado=${estado}`,
      { headers: this.getHeaders() }
    );
  }

  // Buscar solicitudes por empleado
  buscarPorEmpleado(termino: string): Observable<SolicitudVacacionesJefe[]> {
    return this.http.get<SolicitudVacacionesJefe[]>(
      `${this.apiUrl}/solicitudes-vacaciones-jefe?buscar=${termino}`,
      { headers: this.getHeaders() }
    );
  }
}
