import { Pipe, PipeTransform } from '@angular/core';
import { Postulacion } from '../../../services/postulacionesadmin.service';

@Pipe({
  name: 'filterPostulacion',
  standalone: true
})
export class FilterPostulacionPipe implements PipeTransform {

  transform(postulaciones: Postulacion[], filtroTerm: string): Postulacion[] {
    if (!filtroTerm || filtroTerm.trim() === '') {
      return postulaciones;
    }

    const lowerTerm = filtroTerm.toLowerCase();

    return postulaciones.filter(postulacion => {
      const documento = postulacion.numDocumento?.toString() || '';
      const nombre = `${postulacion.usuario?.primerNombre ?? ''} ${postulacion.usuario?.primerApellido ?? ''}`.toLowerCase();
      const vacante = postulacion.vacante?.nomVacante?.toLowerCase() || '';

      return (
        documento.includes(lowerTerm) ||
        nombre.includes(lowerTerm) ||
        vacante.includes(lowerTerm)
      );
    });
  }
}
