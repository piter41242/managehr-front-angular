import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError, tap } from 'rxjs';
export interface Incapacidad {
  idIncapacidad: number;
  archivo: string;
  fechaInicio: string;
  fechaFinal: string;
  contratoId: number;
  estado: number;
  contrato?: {
    idContrato: number;
    tipoContratoId: number;
    hojaDeVida: number;
    area: number;
    cargoArea: number;
    fechaIngreso: string;
    fechaFinalizacion: string;
    archivo: string;
    estado: number;

    hoja_de_vida?: {
      idHojaDeVida: number;
      claseLibretaMilitar: string;
      numeroLibretaMilitar: string;
      usuarioNumDocumento: number;

      usuario?: {
        numDocumento: number;
        primerNombre: string;
        segundoNombre?: string;
        primerApellido: string;
        segundoApellido?: string;
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

        user?: {
          id: number;
          name: string;
          email: string;
          email_verified_at?: string;
          rol: number;
          created_at: string;
          updated_at: string;

          perfil?: {
            numDocumento: number;
            primerNombre: string;
            segundoNombre?: string;
            primerApellido: string;
            segundoApellido?: string;
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
          };
        };
      };
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class IncapacidadService {
  private apiUrl = 'https://www.evensoft21.com/managehr/api/public/api/incapacidad'; // Ajusta si usas otra ruta

  constructor(private http: HttpClient) {}

  obtenerTodas(): Observable<Incapacidad[]> {
    return this.http
      .get<{ data: Incapacidad[] }>(this.apiUrl)
      .pipe(map((response) => response.data));
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
  cambiarEstado(id: number,estado: number) {
   
    return this.http.put(`${this.apiUrl}/estado/${id}`, {
      estado,
    });
  }
}
