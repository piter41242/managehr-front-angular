import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz de datos de la API
export interface Vacante {
  idVacantes: number;
  nomVacante: string;
  descripVacante: string;
  salario: number;
  expMinima: string;
  cargoVacante: string;
  catVacId: number;
}

@Injectable({
  providedIn: 'root'
})
export class VacantesService {
  private apiUrl = 'https://www.evensoft21.com/managehr/api/public/api/vacantesExternos';

  constructor(private http: HttpClient) {}

  getVacantes(): Observable<Vacante[]> {
    return this.http.get<Vacante[]>(this.apiUrl);
  }

  // Si deseas agregar un método futuro para postulación:
  // postularUsuario(data: any): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/postulaciones`, data);
  // }
}
