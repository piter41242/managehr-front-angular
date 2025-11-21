import { Injectable } from '@angular/core';
import { HttpClient,HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError, tap } from 'rxjs';

// en vacacion.model.ts
export interface Vacacion {
  idVacaciones: number;
  motivo: string;
  fechaInicio: string;
  fechaFinal: string;
  contratoId: number;
  dias: number;
  estado: string;
  contrato: {
    idContrato: number;
    tipoContratoId: number;
    hojaDeVida: number;
    area: {
      idArea: number;
      nombreArea: string;
      jefePersonal: string;
      idJefe: number | null;
      estado: number;
    };
    cargoArea: number;
    fechaIngreso: string;
    fechaFinalizacion: string;
    archivo: string;
    estado: number;
    tipo_contrato: {
      idTipoContrato: number;
      nomTipoContrato: string;
    };
    hoja_de_vida: {
      idHojaDeVida: number;
      claseLibretaMilitar: string;
      numeroLibretaMilitar: string;
      usuarioNumDocumento: number;
      usuario: {
        numDocumento: number;
        primerNombre: string;
        segundoNombre: string | null;
        primerApellido: string;
        segundoApellido: string | null;
        email: string;
        telefono: string;
        direccion: string;
        fechaNac: string;
      };
    };
  };
}


@Injectable({
  providedIn: 'root'
})
export class VacacionesService {

  private apiUrl = 'https://www.evensoft21.com/managehr/api/public/api/vacaciones'; // Asegúrate que tu backend use prefix /api

  constructor(private http: HttpClient) {}

 getVacaciones(): Observable<Vacacion[]> {
  return this.http.get<{ vacaciones: Vacacion[] }>(this.apiUrl).pipe(
    map(response => response.vacaciones)
  );
}

  getVacacion(id: number): Observable<Vacacion> {
    return this.http.get<Vacacion>(`${this.apiUrl}/${id}`);
  }

  agregarVacacion(data: Vacacion): Observable<Vacacion> {
    return this.http.post<Vacacion>(this.apiUrl, data);
  }

  actualizarVacacion(id: number, data: Vacacion): Observable<Vacacion> {
    return this.http.put<Vacacion>(`${this.apiUrl}/${id}/estado`, data);
  }

  eliminarVacacion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  getVacacionPorId(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

}
