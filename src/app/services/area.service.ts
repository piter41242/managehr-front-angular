import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Areas {
 
  idArea: number;
  nombreArea: string;         
  jefePersonal: string;
  idJefe:number
  estado: number;
}
@Injectable({
  providedIn: 'root'
})
export class AreaService {
  private apiUrl = 'https://www.evensoft21.com/managehr/api/public/api/area';
  constructor(private http:HttpClient) { }
  obtenerAreas(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => {
       
        return res.areas;
      })
      
    );
  }
  getJefesDePersonal(): Observable<any> {
    return this.http.get('https://www.evensoft21.com/managehr/api/public/api/jefepersonal/all');
  }

  obtenerAreaId(id:number){
    return this.http.get<any>(`https://www.evensoft21.com/managehr/api/public/api/area/${id}`);
  }
  eliminarAreaId(id:number){
    return this.http.delete<any>(`https://www.evensoft21.com/managehr/api/public/api/area/${id}`);
  }
  agregarArea(area: any) {
    return this.http.post<any>('https://www.evensoft21.com/managehr/api/public/api/area', area);

  }
  
  obtenerNombre(nombre: string): Observable<any> {
    return this.http.get(`https://www.evensoft21.com/managehr/api/public/api/area-nombre/${nombre}`);
  }
  
  actualizarArea(id: number, datos: any) {
    return this.http.put(`https://www.evensoft21.com/managehr/api/public/api/area/${id}`, datos);
  }
  verificarCorreoExistente(email: string): Observable<any> {
  return this.http.get(`https://www.evensoft21.com/managehr/api/public/api/verificar-user`, {
    params: { email }
  });
}


}
