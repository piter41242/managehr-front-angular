// src/app/services/gestion.service.ts
// --> Asegúrate de que este archivo está en esta ruta o similar <--

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators'; // *** Importa 'map' aquí ***


// === INTERFAZ CATEGORIA VACANTE ===
// Define la estructura de UNA Categoría de Vacante
export interface CategoriaVacante {
  idCatVac?: number;
  nomCategoria: string;
  // Asegúrate de que esta interfaz coincide con las propiedades de un solo objeto categoría que tu backend devuelve
}

// *** NUEVA INTERFAZ: Estructura de la RESPUESTA COMPLETA del endpoint GET /categoriavacantes ***
// Esta interfaz representa el objeto que recibes de tu backend, que contiene el array de categorías
interface CategoriaVacantesResponse {
    categoriavacantes: CategoriaVacante[]; // La clave 'categoriavacantes' contiene un array de CategoriaVacante
    // Si la respuesta incluye otras propiedades a nivel raíz (ej: 'message', 'status'), añádelas aquí
    // message?: string;
    // status?: number;
}


// === INTERFAZ VACANTE ===
// Define la estructura de los datos de una Vacante
export interface Vacante {
  idVacantes?: number;
  nomVacante: string;
  descripVacante?: string;
  salario?: number;
  expMinima?: string;
  cargoVacante?: string;
  catVacId?: number | null;
  // Asegúrate de que esta interfaz coincide con tu modelo Laravel y la respuesta de tu API
}

// === SERVICIO VacanteService ===
// Clase que maneja la comunicación con la API de vacantes y categorías.
@Injectable({
  providedIn: 'root'
})
export class VacanteService { // <-- EL NOMBRE DE LA CLASE DEL SERVICIO

  // *** URL BASE DE TU API PARA VACANTES (EXISTENTE) ***
  // Esta URL se mantiene exactamente como la tienes: https://www.evensoft21.com/managehr/api/public/api/vacantes
  private apiUrlVacantes = 'https://www.evensoft21.com/managehr/api/public/api/vacantes'; // <-- Tu URL original para Vacantes

  // *** NUEVA URL BASE DE TU API PARA CATEGORÍAS (CORREGIDA) ***
  // Apunta a la ruta GET que definiste en Laravel (EL NOMBRE DE LA RUTA ERA PLURAL)
  private apiUrlCategorias = 'https://www.evensoft21.com/managehr/api/public/api/categoriavacantes'; // <--- *** CORREGIDA A RUTA PLURAL /categoriavacantes ***


  constructor(private http: HttpClient) { }

  // --- Métodos CRUD Vacantes (Utilizan apiUrlVacantes) ---

  // Método para obtener TODAS las vacantes
  getVacantes(): Observable<Vacante[]> {
    return this.http.get<Vacante[]>(this.apiUrlVacantes).pipe( // Usa apiUrlVacantes
      // tap(data => console.log('Vacantes recibidas:', data)), // Descomenta para depurar
      catchError(this.handleError)
    );
  }

  // Método para crear una NUEVA vacante
  createVacante(vacante: Vacante): Observable<Vacante> {
    const { idVacantes, ...vacanteToCreate } = vacante;
    return this.http.post<Vacante>(this.apiUrlVacantes, vacanteToCreate).pipe( // Usa apiUrlVacantes
      // tap(newVacante => console.log('Vacante creada:', newVacante)),
      catchError(this.handleError)
    );
  }

  // Método para ACTUALIZAR una vacante existente
  updateVacante(vacante: Vacante): Observable<Vacante> {
     if (vacante.idVacantes === undefined || vacante.idVacantes === null) {
         console.error('Error: Intento de actualizar vacante sin idVacantes.');
         return throwError(() => new Error('No se puede actualizar una vacante sin ID (idVacantes).'));
     }
     return this.http.put<Vacante>(`${this.apiUrlVacantes}/${vacante.idVacantes}`, vacante).pipe( // Usa apiUrlVacantes
       // tap(() => console.log(`Vacante actualizada: ${vacante.idVacantes}`)),
       catchError(this.handleError)
     );
  }

  // Método para ELIMINAR una vacante por su ID
  deleteVacante(id: number): Observable<void> { // Tipo ajustado a 'number'
    return this.http.delete<void>(`${this.apiUrlVacantes}/${id}`).pipe( // Usa apiUrlVacantes
      // tap(() => console.log(`Vacante eliminada: ${id}`)),
      catchError(this.handleError)
    );
  }

  // --- Método para obtener la lista de categorías (Utiliza apiUrlCategorias) ---
  // *** Modificado para manejar el formato de respuesta específico de tu backend ***
  obtenerCategoriasVacante(): Observable<CategoriaVacante[]> {
    // Hace la petición GET al endpoint de categorías
    // *** Espera un objeto con la estructura CategoriaVacantesResponse ({ categoriavacantes: [...] }) ***
    return this.http.get<CategoriaVacantesResponse>(this.apiUrlCategorias).pipe( // Espera la interfaz Response
       // *** Usa el operador 'map' para extraer el array de categorías del objeto de respuesta ***
       map(response => response.categoriavacantes), // <-- Extrae el array con la clave 'categoriavacantes'
       // tap(data => console.log('Categorías extraídas:', data)), // Descomenta para depurar
       catchError(this.handleError) // Reutiliza el manejador de errores
    );
  }

  // --- Manejo de Errores HTTP ---
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del lado del cliente: ${error.error.message}`;
    } else {
      errorMessage = `Error del servidor: ${error.status}, `;
      errorMessage += error.error?.message || error.statusText;
      console.error('Detalles del error:', error);
    }
    console.error('Error en el servicio:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}