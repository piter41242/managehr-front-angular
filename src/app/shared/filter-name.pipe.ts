import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterNombre',
  standalone: true
})
export class FilterNamePipe implements PipeTransform {
  transform(items: any[], texto: string): any[] {
    if (!items) return [];
    if (!texto) return items;
    texto = texto.toLowerCase();
    return items.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(texto)
      )
    );
  }
}

