import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface EmpleadosResponse {
  empleados: any[];
  area: string;
  message: string;
  
}

@Injectable({ providedIn: 'root' })
export class JefePersonalService {
  private apiUrl = 'https://www.evensoft21.com/managehr/api/public/api';

  constructor(private http: HttpClient) {}

  obtenerEmpleados(): Observable<any> {
    return this.http.get(`${this.apiUrl}/jefe-personal/empleados`);
  }

  obtenerAreas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/jefe-personal/areas`);
  }

  getEmpleadosPorJefe(jefeId: number): Observable<EmpleadosResponse> {
    return this.http.get<EmpleadosResponse>(`${this.apiUrl}/jefe-personal/empleados/${jefeId}`);
  }

  getHojaDeVidaPorDocumento(numDocumento: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/hojasvida/documento/${numDocumento}`);
  }
  
  getEstudiosPorHoja(idHojaDeVida: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/hojasvidahasestudios/por-hoja/${idHojaDeVida}`);
  }
  
  getExperienciaPorHoja(idHojaDeVida: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/hojasvidahasexperiencia/hoja/${idHojaDeVida}`);
  }
} 