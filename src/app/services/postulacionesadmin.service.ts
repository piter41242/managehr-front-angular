import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
// Interfaces de datos
export interface Vacante {
  idVacantes: number;
  nomVacante: string;
  descripVacante: string;
  salario: number;
  expMinima: string;
  cargoVacante: string;
  catVacId: number;
}

// src/app/models/postulacion.model.ts
export interface Postulacion {
  idPostulaciones: number;
  fechaPostulacion: string;
  fecha_formateada: string;
  estado: number;
  vacantesId: number;
  numDocumento: number;

  usuario?: {
    primerNombre: string;
    primerApellido: string;
  };

  vacante?: {
    idVacantes: number;
    nomVacante: string;
    descripVacante: string;
    salario: number;
    expMinima: string;
    cargoVacante: string;
    catVacId: number;
  };
}



@Injectable({
  providedIn: 'root'
})
export class PostulacionesadminService {
   private apiUrl = 'https://www.evensoft21.com/managehr/api/public/api/postulaciones';
  constructor(private http: HttpClient) { }


  getPostulaciones(): Observable<Postulacion[]> {
    return this.http.get<{ data: Postulacion[] }>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }



  private mapEstado(estado: number): 'Pendiente' | 'Aceptado' | 'Rechazado' {
    switch (estado) {
      case 0: return 'Pendiente';
      case 1: return 'Aceptado';
      case 2: return 'Rechazado';
      default: return 'Pendiente';
    }
  }
  getReportePorVacante(): Observable<any> {
    return this.http.get('https://www.evensoft21.com/managehr/api/public/api/postulaciones/reporte/vacante');
  }
  getReportePorEstado(): Observable<any> {
    return this.http.get('https://www.evensoft21.com/managehr/api/public/api/postulaciones/reporte/estado');
  }
  getReporteInternos(): Observable<any> {
    return this.http.get('https://www.evensoft21.com/managehr/api/public/api/postulaciones/reporte/internos');
  }
  actualizarEstado(id: number,estado : number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, { estado });
  }

}
