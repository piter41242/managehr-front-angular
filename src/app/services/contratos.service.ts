import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
export interface Contratos {
  idContrato: number;
  tipoContratoId: number;
  estado: number;
  fechaIngreso: string;
  fechaFinalizacion: string;
  archivo: string | null;
  cargoArea: number;
  area: {
    idArea: number;
    nombreArea: string;
  };
  hoja_de_vida: {
    idHojaDeVida: number;
    usuarioNumDocumento: number;
    usuario: {
      idUsuario: number;
      numDocumento: number;
      primerNombre: string;
      primerApellido: string;
    };
  };
  tipo_contrato: {
    idTipoContrato: number;
    nomTipoContrato: string;
  };
}

export interface HojaDeVida {
  idHojaDeVida: number;
  usuarioNumDocumento: number;
  usuario: Usuario;
}
export interface Usuario {
  idUsuario: number;
  numDocumento: number;
  primerNombre: string;
  primerApellido: string;
}
@Injectable({
  providedIn: 'root'
})
export class ContratosService {
  
  private apiUrl = 'https://www.evensoft21.com/managehr/api/public/api/contrato';

  constructor(private http: HttpClient) {}
  
  obtenerContratos(): Observable<Contratos[]> {
    return this.http.get<{ contratos: Contratos[]; status: number }>(this.apiUrl)
      .pipe(
        map(response => response.contratos) 
      );
  }


 obtenerContratoPorDocumento(numDocumento: number): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  return this.http.get<any>(`https://www.evensoft21.com/managehr/api/public/api/contrato-usuario/${numDocumento}`, { headers })
    .pipe(
      map(res => res.contrato) // 
    );
}


  agregarContrato(contrato: any) {
    return this.http.post<Contratos>('https://www.evensoft21.com/managehr/api/public/api/contrato', contrato);
  }
  obtenerTiposContrato(): Observable<any[]> {
    return this.http.get<any>('https://www.evensoft21.com/managehr/api/public/api/tipocontrato').pipe(
      map(res => res.tipocontrato) 
    );
  }
  
  obtenerAreas():Observable<any[]>{
    return this.http.get<any>('https://www.evensoft21.com/managehr/api/public/api/area').pipe(
      map(res => res.areas)
    );
  }
  obtenerNacionalidades(): Observable<any[]> {
    return this.http.get<any>('https://www.evensoft21.com/managehr/api/public/api/nacionalidad').pipe(
      map(res => res.Nacionalidad) 
    );
  }
 
actualizarContratoParcial(id: number, formData: FormData) {
  
  return this.http.post(`https://www.evensoft21.com/managehr/api/public/api/contrato/${id}/actualizar`, formData);
}
 obtenerHojadevida(id:number):Observable<any[]>{
  return this.http.get<any>(`https://www.evensoft21.com/managehr/api/public/api/hojasvida/${id}`).pipe(
    map(res => res.hojadevida) 
  );
 }
 obtenerNumDocumento(id:number):Observable<any[]>{
  return this.http.get<any>(`https://www.evensoft21.com/managehr/api/public/api/contrato-usuario/${id}`).pipe(
    map(res => res.contrato) 
  );
 }

  
  
  obtenerEps(): Observable<any[]> {
    return this.http.get<any>('https://www.evensoft21.com/managehr/api/public/api/epss').pipe(
      map(res => res.Eps) 
    );
  }
  eliminarContrato(id: number): Observable<any> {
    return this.http.delete<any>(`https://www.evensoft21.com/managehr/api/public/api/contrato/${id}`);
  }
  obtenerUsuarioPorDocumento(documento: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${documento}`);
  }
  
  obtenerContrato(id: number): Observable<any> {
    return this.http.get<any>(`https://www.evensoft21.com/managehr/api/public/api/contrato/${id}`);
  }
  
  obtenerGeneros(): Observable<any[]> {
    return this.http.get<any>('https://www.evensoft21.com/managehr/api/public/api/genero').pipe(
      map(res => res.Genero) 
    );
  }
  
  obtenerTiposDocumento(): Observable<any[]> {
    return this.http.get<any>('https://www.evensoft21.com/managehr/api/public/api/tipodocumento').pipe(
      map(res => res.TipoDocumento) 
    );
  }
  
  obtenerEstadosCiviles(): Observable<any[]> {
    return this.http.get<any>('https://www.evensoft21.com/managehr/api/public/api/estadocivil').pipe(
      map(res => res.EstadoCivil) 
    );
  }
  
  obtenerPensiones(): Observable<any[]> {
    return this.http.get<any>('https://www.evensoft21.com/managehr/api/public/api/pensiones').pipe(
      map(res => res.Pensiones) 
    );
  }
  obtenerContratosCompletos(): Observable<{ mensaje: string, data: any[] }> {
    return this.http.get<{ mensaje: string, data: any[] }>(`https://www.evensoft21.com/managehr/api/public/api/contrato/reporte/area`);
  }

}
