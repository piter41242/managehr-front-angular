import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterMisPostulaciones'
})
export class FilterMisPostulacionesPipe implements PipeTransform {

  transform(postulaciones: any[], searchQuery: string): any[] {
    if (!searchQuery || searchQuery.trim() === '') {
      return postulaciones;  // Si no hay término de búsqueda, devuelve todas las postulaciones
    }
    return postulaciones.filter(postulacion => 
      postulacion.vacantesId.toString().includes(searchQuery) || 
      postulacion.idPostulaciones.toString().includes(searchQuery)  // Filtra por Vacante ID o ID de Postulación
    );
  }
}
