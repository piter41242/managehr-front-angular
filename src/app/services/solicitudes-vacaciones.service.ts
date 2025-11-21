import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SolicitudVacaciones {
  idVacaciones?: number;
  motivo: string;
  fechaInicio: string;
  fechaFinal: string;
  dias: number;
  contratoId: number;
  estado?: 'pendiente' | 'aprobado' | 'rechazado'; 
}

@Injectable({ providedIn: 'root' })
export class SolicitudesVacacionesService {
  private apiUrl = 'https://www.evensoft21.com/managehr/api/public/api/solicitudes-vacaciones-con-archivo';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token')!;
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // POST
  enviarSolicitud(solicitud: SolicitudVacaciones): Observable<SolicitudVacaciones> {
    return this.http.post<SolicitudVacaciones>(
      this.apiUrl,
      solicitud,
      { headers: this.getHeaders() }
    );
  }

  // GET → SOLO MIS SOLICITUDES
  obtenerSolicitudesUsuario(): Observable<SolicitudVacaciones[]> {
    return this.http.get<SolicitudVacaciones[]>(
      this.apiUrl,
      { headers: this.getHeaders() }
    );
  }

  // GET contrato
  obtenerContratoDelUsuario(numDocumento: string): Observable<any> {
    return this.http.get(
      `https://www.evensoft21.com/managehr/api/public/api/contrato-usuario/${numDocumento}`,
      { headers: this.getHeaders() }
    );
  }
}
