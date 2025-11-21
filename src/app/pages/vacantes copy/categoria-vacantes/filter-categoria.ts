import { Pipe, PipeTransform } from '@angular/core';
// === 1. CORREGIR LA RUTA DE IMPORTACIÓN DE CATEGORIA ===
// Importar Categoria desde el servicio donde está definida y exportada
import { Categoria } from '../../../services/categoria.service'; // <-- ¡RUTA CORREGIDA!

@Pipe({
  name: 'filterCategoria', // Asegúrate de que el nombre coincida con cómo lo usas en el HTML
  standalone: true // O false si no es standalone
  // pure: true // O false
})
export class FilterCategoriaPipe implements PipeTransform {

  // Asume que filtroNombre es una cadena de texto
  // El segundo parámetro se llama 'filtroNombre' en tu componente y HTML, así que lo mantenemos aquí para claridad.
  transform(categorias: Categoria[], filtroNombre: string): Categoria[] {
    // Si no hay filtro, retorna la lista completa
    if (!filtroNombre) {
      return categorias;
    }

    // Convierte el filtro a minúsculas para búsqueda insensible a mayúsculas/minúsculas
    const filtroLower = filtroNombre.toLowerCase();

    // Filtra el array de categorías
    return categorias.filter(categoria => {
      // === 2. CORREGIR LA PROPIEDAD USADA PARA FILTRAR ===
      // Cambia 'categoria.nombre' por 'categoria.nomCategoria'
      return categoria.nomCategoria.toLowerCase().includes(filtroLower);
      // Si quieres buscar por ID también (aunque es menos común en filtros de texto):
      // || (categoria.idCatVac ? categoria.idCatVac.toString().includes(filtroLower) : false)
    });
  }

}