import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://www.evensoft21.com/managehr/api/public/api/profile';
  private updateUrl = 'https://www.evensoft21.com/managehr/api/public/api/profile/update';

  constructor(private http: HttpClient) {}

  /**
   * Método para obtener el perfil del usuario autenticado.
   */
  getUserProfile(): Observable<any> {
    const token = localStorage.getItem('token'); 
    if (!token) {
      throw new Error('Token no encontrado en localStorage');
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<any>(this.apiUrl, { headers });
  }

  /**
   * Método para actualizar el perfil del usuario.
   * @param data Contiene solo los campos permitidos para actualización
   */
  updateUserProfile(data: any): Observable<any> {
    const token = localStorage.getItem('token'); 
    if (!token) {
      throw new Error('Token no encontrado en localStorage');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.put(this.updateUrl, data, { headers });
  }
}
