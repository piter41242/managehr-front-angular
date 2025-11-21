

import { Pipe, PipeTransform } from '@angular/core';

import { Vacante } from '../../../services/gestion.service'; 

@Pipe({
  name: 'filterVacante', 
  standalone: true
})
export class FilterVacantePipe implements PipeTransform {

  transform(vacantes: Vacante[] | null | undefined, filtro: string): Vacante[] {
   
    if (!vacantes || !filtro) {
      return vacantes || [];
    }

    const lowerCaseFiltro = filtro.toLowerCase();

    
    return vacantes.filter(vacante => {
       
       return vacante.nomVacante?.toLowerCase().includes(lowerCaseFiltro) ||
       vacante.cargoVacante?.toLowerCase().includes(lowerCaseFiltro);


       
    });
   
  }
}