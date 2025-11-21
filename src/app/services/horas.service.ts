import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HorasService {
  private apiUrl = 'https://www.evensoft21.com/managehr/api/public/api/horas-extra';

  constructor(private http: HttpClient) {}

  enviarHoras(data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(this.apiUrl, data, { headers });
  }

  obtenerSolicitudesHoras(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(this.apiUrl, { headers });
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
