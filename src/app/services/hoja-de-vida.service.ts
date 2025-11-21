import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HojaDeVidaService {
  private apiUrl = 'https://www.evensoft21.com/managehr/api/public/api';

  constructor(private http: HttpClient) {}

  // Obtener hoja de vida por número de documento
  getHojaDeVidaPorDocumento(numDocumento: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/hojasvida/documento/${numDocumento}`);
  }

  // También podrías querer agregar método para actualizar
  actualizarHojaDeVida(idHoja: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/hojasvida/${idHoja}`, data);
  }
}
