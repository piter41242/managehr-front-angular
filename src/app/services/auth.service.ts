import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://www.evensoft21.com/managehr/api/public/api';

  constructor(private http: HttpClient) {}

  getUsuario(): Observable<any> {
    const token = localStorage.getItem('token'); // Obtener el token de autenticación desde el localStorage
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}` // Incluir el token en los encabezados de la solicitud
    });

    return this.http.get<any>(`${this.apiUrl}/user`, { headers });
  }

  register(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
      })
    );
  }

  getProfile(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.get(`${this.apiUrl}/me`, { headers });
  }

  logout(): void {
    localStorage.removeItem('token');
    sessionStorage.clear(); // Limpia cualquier dato de sesión
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe(); // Notifica al backend si es necesario
  }
  eliminarUser(id: number): Observable<any> {
    return this.http.delete<any>(`https://www.evensoft21.com/managehr/api/public/api/login/${id}`);
  }
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token; // si no hay token, devuelve false
  }
  verificarExistenciaUsuario(email: string): Observable<boolean> {
      return this.http.get<any>(`https://www.evensoft21.com/managehr/api/public/api/verificar-user`, {
        params: { email }
      }).pipe(
        tap(res => res)
      );
  }
  actualizarRol(idUsuario: number, nuevoRol: number) {
    return this.http.patch(`${this.apiUrl}/rols/${idUsuario}`, { rol: nuevoRol });
  }
  verificarCorreoExistente(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verificar-user`, {
      params: { email }
    });
  }
  verificarNumDocYUsuario(numDocumento: string, usuario: string): Observable<any> {
    return this.http.get<any>('https://www.evensoft21.com/managehr/api/public/api/verificar-numdoc-usuario', {
      params: { numDocumento, usuario }
    });
    
  }
  crearUsuario(data: any): Observable<any> {
    return this.http.post('https://www.evensoft21.com/managehr/api/public/api/usuarios', data);
  }

  
  
}
