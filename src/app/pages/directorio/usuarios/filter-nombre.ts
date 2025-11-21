import { Pipe, PipeTransform } from '@angular/core';
import { Usuarios } from '../../../services/usuarios.service';

@Pipe({
  name: 'filterNombre',
  standalone: true,
  pure: false
})
export class FilterNombre implements PipeTransform {
  transform(usuarios: Usuarios[], filtro: string): Usuarios[] {
    if (!usuarios || !filtro) return usuarios;

    const normalizar = (texto: string) =>
      texto
        .toLowerCase()
        .normalize('NFD') // Quita tildes
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ') // reemplaza múltiples espacios por uno solo
        .trim();

    const filtroNormalizado = normalizar(filtro);

    return usuarios.filter((u) => {
      const nombreCompleto = `${u.primerNombre} ${u.segundoNombre || ''} ${u.primerApellido} ${u.segundoApellido || ''}`;
      const nombreNormalizado = normalizar(nombreCompleto);
      const documento = String(u.numDocumento);

      return (
        nombreNormalizado.includes(filtroNormalizado) ||
        documento.includes(filtroNormalizado)
      );
    });
  }
}
