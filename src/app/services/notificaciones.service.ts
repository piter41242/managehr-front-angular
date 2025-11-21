import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Notificacion {
  idNotificacion: number;
  tipo: string;
  accion: string;
  fecha: string;
  detalle: string;
  estado: number;
  referenciaId: number;
  contratoId: number;

  // Estas dos propiedades son necesarias para los filtros
  areaId?: number;     // ← Agrega esta
  usuarioId?: number;  // ← Y esta

  contrato?: {
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
    hoja_de_vida: {
      idHojaDeVida: number;
      claseLibretaMilitar: string;
      numeroLibretaMilitar: string;
      usuarioNumDocumento: number;
      usuario: {
        numDocumento: number;
        primerNombre: string;
        segundoNombre?: string;
        primerApellido: string;
        segundoApellido?: string;
        usersId: number;
        [key: string]: any;
      };
    };
  };
}


@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
 private apiUrl = 'https://www.evensoft21.com/managehr/api/public/api/notificaciones';
  constructor(private http: HttpClient) { }
  getAll(): Observable<{ Notificaciones: Notificacion[] }> {
    return this.http.get<{ Notificaciones: Notificacion[] }>(this.apiUrl);
  }

  actualizarEstado(id: number, nuevoEstado: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/estado`, { estado: nuevoEstado });
  }
}
