import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroHistorial',
  standalone: true
})
export class FiltroHistorialPipe implements PipeTransform {

  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();

    return items.filter(item => {
      const usuarioNombre = item?.contrato?.hoja_de_vida?.usuario?.primerNombre ?? '';
      const usuarioApellido = item?.contrato?.hoja_de_vida?.usuario?.primerApellido ?? '';
      const tipo = item?.tipo ?? '';
      const detalle = item?.detalle ?? '';

      return (
        usuarioNombre.toLowerCase().includes(searchText) ||
        usuarioApellido.toLowerCase().includes(searchText) ||
        tipo.toLowerCase().includes(searchText) ||
        detalle.toLowerCase().includes(searchText)
      );
    });
  }

}
