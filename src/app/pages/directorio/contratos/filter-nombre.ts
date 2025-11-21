import { Pipe, PipeTransform } from '@angular/core';
import { Contratos } from '../../../services/contratos.service';

@Pipe({
  name: 'filterNombre',
  standalone: true
})
export class FilterNombre implements PipeTransform {
  transform(contratos: Contratos[], filtro: string): Contratos[] {
    if (!filtro || !contratos) return contratos;

    const filtroLower = filtro.toLowerCase();

    return contratos.filter(c => {
      // Datos del usuario
      const primerNombre = c.hoja_de_vida.usuario?.primerNombre || '';
      const primerApellido = c.hoja_de_vida.usuario?.primerApellido || '';
      const nombreCompleto = `${primerNombre} ${primerApellido}`.toLowerCase();

      // Documento
      const numDocumento = c.hoja_de_vida.usuario?.numDocumento?.toString() || '';

      // Fechas
      const fechaIngreso = c.fechaIngreso || '';
      const fechaFinalizacion = c.fechaFinalizacion || '';

      // Área
      const nombreArea = c.area?.nombreArea?.toLowerCase() || '';

      // Cargo
      const cargoMap: { [key: number]: string } = {
        1: 'empleado',
        2: 'jefe de área',
        3: 'coordinador',
        4: 'director'
      };
      const cargoNombre = cargoMap[c.cargoArea]?.toLowerCase() || '';

      // Verificar si alguno de los campos incluye el filtro
      return (
        nombreCompleto.includes(filtroLower) ||
        numDocumento.includes(filtroLower) ||
        fechaIngreso.includes(filtroLower) ||
        fechaFinalizacion.includes(filtroLower) ||
        nombreArea.includes(filtroLower) ||
        cargoNombre.includes(filtroLower)
      );
    });
  }
}
