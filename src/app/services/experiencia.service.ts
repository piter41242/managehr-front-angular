import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExperienciaService {
  private baseUrl = 'https://www.evensoft21.com/managehr/api/public/api';
  private experienciaUrl = `${this.baseUrl}/experiencia`;
  private relacionUrl = `${this.baseUrl}/hojasvidahasexperiencia`;

  constructor(private http: HttpClient) {}

  // Obtener experiencias por ID de hoja de vida
  getPorHojaDeVida(idHoja: number): Observable<any> {
    return this.http.get(`${this.relacionUrl}/hoja/${idHoja}`);
  }

  // Crear una nueva experiencia laboral
  create(data: any): Observable<any> {
    return this.http.post(`${this.experienciaUrl}`, data);
  }

  // Crear relación hoja de vida ↔ experiencia
  createRelacionExperiencia(relacion: any): Observable<any> {
    return this.http.post(`${this.relacionUrl}`, relacion);
  }

  // Eliminar relación hoja de vida - experiencia
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.relacionUrl}/${id}`);
  }

  // Crear experiencia laboral incluyendo archivo (usando FormData)
  createConArchivo(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/experiencia-con-archivo`, formData);
  }
}

