import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError, tap } from 'rxjs';
export interface Rol {
  idRol: number;
  nombreRol: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  rol: Rol;
  created_at: string;
  updated_at: string;
  perfil?: Perfil;
}

export interface Perfil {
  numDocumento: number;
  primerNombre: string;
  segundoNombre?: string | null;
  primerApellido: string;
  segundoApellido?: string | null;
  password: string;
  fechaNac: string;
  numHijos: number;
  contactoEmergencia: string;
  numContactoEmergencia: string;
  email: string;
  direccion: string;
  telefono: string;
  nacionalidadId: number;
  epsCodigo: string;
  generoId: number;
  tipoDocumentoId: number;
  estadoCivilId: number;
  pensionesCodigo: string;
  usersId: number;
}

export interface Usuario {
  numDocumento: number;
  primerNombre: string;
  segundoNombre?: string | null;
  primerApellido: string;
  segundoApellido?: string | null;
  password: string;
  fechaNac: string;
  numHijos: number;
  contactoEmergencia: string;
  numContactoEmergencia: string;
  email: string;
  direccion: string;
  telefono: string;
  nacionalidadId: number;
  epsCodigo: string;
  generoId: number;
  tipoDocumentoId: number;
  estadoCivilId: number;
  pensionesCodigo: string;
  usersId: number;
  user?: User;
}

export interface HojaDeVida {
  idHojaDeVida: number;
  claseLibretaMilitar: string;
  numeroLibretaMilitar: string;
  usuarioNumDocumento: number;
  usuario?: Usuario;
}

export interface Area {
  idArea: number;
  nombreArea: string;
  jefePersonal: string;
  idJefe?: number | null;
  estado: number;
}

export interface Contrato {
  idContrato: number;
  tipoContratoId: number;
  hojaDeVida: number;
  area: Area;
  cargoArea: number;
  fechaIngreso: string;
  fechaFinalizacion: string;
  archivo: string;
  estado: number;
  hoja_de_vida?: HojaDeVida;
}

export interface TipoHoraExtra {
  idTipoHoras: number;
  nombreTipoHoras: string;
}

export interface Horasextra {
  idHorasExtra: number;
  descripcion: string;
  fecha: string;
  tipoHorasId: number;
  nHorasExtra: number;
  contratoId: number;
  tipo_hora_extra?: TipoHoraExtra;
  contrato?: Contrato;
  estado: number;
}
@Injectable({ providedIn: 'root' })
export class HorasextraService {
  private apiUrl = 'https://www.evensoft21.com/managehr/api/public/api/horasextra';  // Asegúrate de que esta URL sea correcta

  constructor(private http: HttpClient) {}

  // Obtener todas las horas extras
  getAll(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Crear una nueva hora extra
  create(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // Eliminar una hora extra por su ID
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Actualizar una hora extra por su ID
  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
   obtenerTodas(): Observable<Horasextra[]> {
      return this.http.get<{ data: Horasextra[] }>(this.apiUrl).pipe(
        
        map(response => response.data)
      );
    }
  
  
    obtenerPorId(id: number): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/${id}`);
    }
  
    crear(data: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}`, data);
    }
  
    actualizar(id: number, data: any): Observable<any> {
      return this.http.put<any>(`${this.apiUrl}/${id}`, data);
    }
  
    eliminar(id: number): Observable<any> {
      return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }
  
    // Si necesitas buscar por documento, podrías agregar:
    buscarPorDocumento(documento: string): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/buscar/${documento}`);
    }
    cambiarEstado(id: number, nuevoEstado: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/estado/${id}`, {
      estado: nuevoEstado,
    });
}

}
