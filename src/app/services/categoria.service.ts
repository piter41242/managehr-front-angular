import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Categoria {
  idCatVac?: number;
  nomCategoria: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  private categoriasEndpointUrl = 'https://www.evensoft21.com/managehr/api/public/api/categoriavacantes';

  constructor(private http: HttpClient) { }

  getCategorias(): Observable<Categoria[]> {
    
    return this.http.get<any>(this.categoriasEndpointUrl).pipe(
      map(res => {
        
        if (res && Array.isArray(res.categoriavacantes)) {
          return res.categoriavacantes as Categoria[];
        } else {
           console.error('[CategoriaService] Unexpected API response format for GET categories:', res);
           throw new Error('Invalid API response format: Expected an array under "categoriavacantes".');
        }
      }),
      catchError(error => {
         console.error('[CategoriaService] Error fetching categories:', error);
         return throwError(() => new Error('Failed to fetch categories. Please try again later.'));
      })
    );
  }

  getCategoria(idCatVac: number): Observable<Categoria> {
     const url = `${this.categoriasEndpointUrl}/${idCatVac}`;
     
     return this.http.get<any>(url).pipe(
        map(res => {
             
             return res as Categoria;
        }),
         catchError(error => {
             console.error(`[CategoriaService] Error fetching category id ${idCatVac}:`, error);
             return throwError(() => new Error(`Failed to fetch category ${idCatVac}.`));
         })
     );
  }

  createCategoria(categoria: Categoria): Observable<Categoria> {
     
     const dataToSend = { nomCategoria: categoria.nomCategoria };
     return this.http.post<any>(this.categoriasEndpointUrl, dataToSend).pipe(
         map(res => {
             
             return res as Categoria;
         }),
          catchError(error => {
              
              let errorMessage = 'Failed to create category.';
               if (error.error && error.error.message) {
                   errorMessage = error.error.message;
               } else if (error.error && error.error.errors) {
                    errorMessage += ' Validation failed: ' + JSON.stringify(error.error.errors);
               }
              return throwError(() => new Error(errorMessage));
          })
     );
  }

  updateCategoria(categoria: Categoria): Observable<Categoria> {
    if (categoria.idCatVac === undefined) {
      const errorMsg = 'Cannot update category without idCatVac';
      
      return throwError(() => new Error(errorMsg));
    }
    const url = `${this.categoriasEndpointUrl}/${categoria.idCatVac}`;
    
    const dataToSend = { nomCategoria: categoria.nomCategoria };
    return this.http.put<any>(url, dataToSend).pipe(
         map(res => {
            
             return res as Categoria; 
         }),
         catchError(error => {
             console.error(`[CategoriaService] Error updating category id ${categoria.idCatVac}:`, error);
              let errorMessage = `Failed to update category ${categoria.idCatVac}.`;
              if (error.error && error.error.message) {
                  errorMessage = error.error.message;
              } else if (error.error && error.error.errors) {
                   errorMessage += ' Validation failed: ' + JSON.stringify(error.error.errors);
              }
             return throwError(() => new Error(errorMessage));
         })
    );
  }

  deleteCategoria(idCatVac: number): Observable<void> {
    const url = `${this.categoriasEndpointUrl}/${idCatVac}`;
    
    return this.http.delete<void>(url).pipe(
         catchError(error => {
            
              let errorMessage = `Failed to delete category ${idCatVac}.`;
              if (error.error && error.error.message) {
                  errorMessage = error.error.message;
              }
             return throwError(() => new Error(errorMessage));
         })
    );
  }
}
