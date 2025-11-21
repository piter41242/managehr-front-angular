import { Pipe, PipeTransform } from '@angular/core';
import { Usuarios } from '../../services/usuarios.service';

@Pipe({
  name: 'filterNombre',
  standalone: true
})
export class FilterNombre implements PipeTransform {
  transform(usuarios: Usuarios[], termino: string): Usuarios[] {
    if (!usuarios || !termino) return usuarios;

    const lowerFiltro = termino.toLowerCase();
    return usuarios.filter(usuario =>
      `${usuario.primerNombre} ${usuario.segundoNombre} ${usuario.primerApellido} ${usuario.segundoApellido} ${usuario.numDocumento}`
        .toLowerCase()
        .includes(lowerFiltro)
    );
  }
}
