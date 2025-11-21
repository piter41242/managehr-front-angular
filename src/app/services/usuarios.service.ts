import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Usuarios {
  id: number;
  numDocumento: number;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  telefono: string;
  email: string;
  email_confirmation: string;
  direccion: string;
  password: string;
  password_confirmation: string;
  nacionalidadId?: number;
  epsCodigo?: string;
  generoId?: number;
  tipoDocumentoId?: number;
  estadoCivilId?: number;
  pensionesCodigo?: string;
  rol: number;
  usersId: number;
  fechaNacimiento: string;

  user?: {
    id: number;
    name: string;
    email: string;
    rol: number;
  };
  nombreRol?: string;

  tipoDocumento?: { nombreTipoDocumento: string };
  genero?: { abreviacionGenero: string };
  estadoCivil?: { nombreEstado: string };
  eps?: { nombreEps: string };
  pensiones?: { nombrePensiones: string };
  nacionalidad?: { nombre: string };

}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = 'https://www.evensoft21.com/managehr/api/public/api/usuarios';

  constructor(private http: HttpClient) { }

  obtenerUsuarios(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => {
        
        return res.usuario;
      })
    );
  }
  agregarUsuario(usuario: any) {
    

    return this.http.post<any>('https://www.evensoft21.com/managehr/api/public/api/usuarios', usuario);
  }
  obtenerUsersId(id: number): Observable<any> {
    return this.http.get<any>(`https://www.evensoft21.com/managehr/api/public/api/auth/${id}`);
  }
  obtenerRol(id: number): Observable<any> {
    return this.http.get<any>(`https://www.evensoft21.com/managehr/api/public/api/rols/${id}`);
  }
  obtenerNacionalidades(): Observable<any[]> {
    return this.http.get<any>('https://www.evensoft21.com/managehr/api/public/api/nacionalidad').pipe(
      map(res => res.Nacionalidad)
    );
  }
  obtenerUsuarioPorDocumento(numDocumento: string) {
    return this.http.get<any>(`https://www.evensoft21.com/managehr/api/public/api/usuarios/documento/${numDocumento}`);
  }

  actualizarUsuarioParcial(id: number, datos: Partial<Usuarios>): Observable<any> {
    return this.http.patch<any>(`https://www.evensoft21.com/managehr/api/public/api/usuarios/${id}`, datos);
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`https://www.evensoft21.com/managehr/api/public/api/usuarios/${id}`);
  }
  eliminarUser(id: number): Observable<any> {
    return this.http.delete<any>(`https://www.evensoft21.com/managehr/api/public/api/login/${id}`);
  }

  obtenerUsuario(id: number): Observable<any> {
    return this.http.get<any>(`https://www.evensoft21.com/managehr/api/public/api/usuarios/${id}`);
  }

  obtenerGeneros(): Observable<any[]> {
    return this.http.get<any>('https://www.evensoft21.com/managehr/api/public/api/genero').pipe(
      map(res => res.genero)
    );
  }
  obtenerUsuariosConRelaciones(): Observable<any[]> {
    return this.http.get<any>('https://www.evensoft21.com/managehr/api/public/api/usuarios-con-relaciones').pipe(
      map(res => res.usuarios)
    );
  }



  obtenerTiposDocumento(): Observable<any[]> {
    return this.http.get<any>('https://www.evensoft21.com/managehr/api/public/api/tipodocumento').pipe(
      map(res => res.tipodocumento)
    );
  }

  obtenerEstadosCiviles(): Observable<any[]> {
    return this.http.get<any>('https://www.evensoft21.com/managehr/api/public/api/estadocivil').pipe(
      map(res => res.estadocivil)
    );
  }

  obtenerEps(): Observable<any[]> {
    return this.http.get<any>('https://www.evensoft21.com/managehr/api/public/api/epss').pipe(
      map(res => res.eps)
    );
  }

  obtenerPensiones(): Observable<any[]> {
    return this.http.get<any>('https://www.evensoft21.com/managehr/api/public/api/pensiones').pipe(
      map(res => res.pensiones)
    );
  }
  obtenerRoles(): Observable<any[]> {
    return this.http.get<any>('https://www.evensoft21.com/managehr/api/public/api/rols').pipe(
      map(res => res.rol)
    );
  }
  obtenerRolId(id: number): Observable<any> {
    return this.http.get<any>(`https://www.evensoft21.com/managehr/api/public/api/rols/${id}`);
  }
  verificarExistenciaUsuario(email: string, documento: number): Observable<boolean> {
    return this.http.get<{ existe: boolean }>('https://www.evensoft21.com/managehr/api/public/api/verificar-usuario', {
      params: { email, documento }
    }).pipe(
      map(res => res.existe)
    );
  }
  actualizarRol(userId: number, nuevoRol: number, correo: string): Observable<any> {
    return this.http.patch(`https://www.evensoft21.com/managehr/api/public/api/auth/rol/${userId}`, { rol: nuevoRol, email: correo });
  }
  actualizarRolId(userId: number, nuevoRol: number): Observable<any> {
    return this.http.patch(`https://www.evensoft21.com/managehr/api/public/api/auth/rol/${userId}`, { rol: nuevoRol });
  }


  getUsuariosRolCinco(): Observable<any[]> {
    return this.http.get<any>('https://www.evensoft21.com/managehr/api/public/api/auth/rolcinco').pipe(
      map(res => res.usuarios)
    );
  }
  obtenerHojaVida(numDocumento: number): Observable<any> {
    return this.http.get<any>(`https://www.evensoft21.com/managehr/api/public/api/hojasvida/${numDocumento}`);
  }

  obtenerExperiencia(numDocumento: number): Observable<any> {
    return this.http.get<any>(`https://www.evensoft21.com/managehr/api/public/api/experiencias/${numDocumento}`);
  }

  obtenerEstudios(numDocumento: number): Observable<any> {
    return this.http.get<any>(`https://www.evensoft21.com/managehr/api/public/api/estudios/${numDocumento}`);
  }
  obtenerHasEstudios(numDocumento: number) {
    return this.http.get<any>(`https://www.evensoft21.com/managehr/api/public/api/hojasvidahasestudios/documento/${numDocumento}`);
  }

  obtenerHojadevida(numDocumento: number): Observable<any> {
    return this.http.get<any>(`https://www.evensoft21.com/managehr/api/public/api/hojasvida/documento/${numDocumento}`);
  }
  
  obtenerExperienciaLaboral(numDocumento: number) {
    return this.http.get<any>(`https://www.evensoft21.com/managehr/api/public/api/hojasvidahasexperiencias/documento/${numDocumento}`);
  }
  getUsuariosConRoles(): Observable<any> {
    return this.http.get<any>('https://www.evensoft21.com/managehr/api/public/api/usuarios/reporte/all');
  }




}

