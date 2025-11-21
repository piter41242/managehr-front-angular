import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Trazabilidad {
  idTrazabilidad: number;
  fechaModificacion: string;
  iP: string;
  usuarioanterior: string;
  usuarionuevo: string;
  claveAnterior: string;
  claveNueva: string;
  numDocumento: number;
}

@Injectable({
  providedIn: 'root'
})
export class TrazabilidadService {
  private apiUrl = 'https://www.evensoft21.com/managehr/api/public/api/trazabilidad';

  constructor(private http: HttpClient) {}

  obtenerTrazabilidad(): Observable<Trazabilidad[]> {
    return this.http.get<{ tipodocumento: Trazabilidad[] }>(this.apiUrl).pipe(
      map(response => response.tipodocumento)
    );
  }


  eliminarTrazabilidad(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  obtenerTrazas(): Observable<Trazabilidad[]> {
    return this.http.get<any>('https://www.evensoft21.com/managehr/api/public/api/trazabilidad').pipe(
      map(res => res.tipodocumento));
  }
}


