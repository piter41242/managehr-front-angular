import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroPersonalizado'
})
export class FiltroPersonalizadoPipe implements PipeTransform {

  transform(lista: any[], texto: string): any[] {
    if (!Array.isArray(lista)) return []; // 👈 verifica que sea array

    if (!texto || texto.trim() === '') return lista;

    texto = texto.toLowerCase();

    return lista.filter(item =>
      JSON.stringify(item).toLowerCase().includes(texto)
    );
  }

}
