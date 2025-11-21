

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import Swal from 'sweetalert2'; 


import { Vacante, VacanteService, CategoriaVacante } from '../../../services/gestion.service';



import { FilterVacantePipe } from './filter-gestion'; 

import { AuthService } from '../../../services/auth.service';
import { MenuComponent } from '../../menu/menu.component';

import { HttpClientModule } from '@angular/common/http';


import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import * as bootstrap from 'bootstrap';


@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MenuComponent,
    FilterVacantePipe,
    HttpClientModule, 
  ],
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.scss']
})
export class GestionComponent implements OnInit {

  vacantes: Vacante[] = []; 

 
  vacanteSeleccionada: Vacante = {
      
      idVacantes: undefined,
      nomVacante: '',        
      descripVacante: '',    
      salario: 0,            
      expMinima: '',        
      cargoVacante: '',     
      catVacId: undefined,   
      
  };

  usuario: any = {};
  paginaActual = 1;
  itemsPorPagina = 5;
  paginas: (number | string)[] = [];


  filtroNombreVacante: string = "";


  categorias: CategoriaVacante[] = []; 
  constructor(
    public authService: AuthService,
    private vacanteService: VacanteService // Aquí se inyecta el servicio
  ) { }

  // --- ngOnInit ---
  ngOnInit(): void {
    const userFromLocal = localStorage.getItem('usuario');
    if (userFromLocal) {
      try {
          this.usuario = JSON.parse(userFromLocal);
      } catch (e) {
          console.error('Error al parsear usuario de localStorage:', e);
          this.usuario = {};
      }
    }
  
    this.cargarVacantes();

    
    this.cargarCategoriasForaneas();
    setTimeout(() => this.generarPaginacion(), 200);
  }

 

  cargarVacantes(): void {
    this.vacanteService.getVacantes().pipe(
      catchError(error => {
        console.error('Error al cargar vacantes:', error);
        const apiErrorMessage = error.error?.message || error.message || 'Error desconocido.';
        Swal.fire('Error', `No se pudieron cargar las vacantes. ${apiErrorMessage}`, 'error');
        return throwError(() => new Error(error.message || 'Error desconocido al cargar vacantes'));
      })
    )
    .subscribe({
      next: (data) => {
        this.vacantes = data;
      },
      error: (error) => {
        console.error('La carga de vacantes falló completamente después del catch.', error);
      },
      complete: () => {}
    });
  }

  // *** NUEVO MÉTODO: Cargar la lista de categorías desde el servicio ***
  cargarCategoriasForaneas(): void {
    // Llama al método en el servicio para obtener la lista de categorías
    this.vacanteService.obtenerCategoriasVacante().pipe(
      catchError(error => {
        console.error('Error al cargar categorías de vacante:', error);
        // Puedes añadir un mensaje al usuario si falla
        Swal.fire('Error', 'No se pudieron cargar las categorías de vacante.', 'error');
        return throwError(() => new Error(error.message || 'Error desconocido al cargar categorías'));
      })
    )
    .subscribe({
      next: (data) => {
        this.categorias = data; // Asigna los datos recibidos a la propiedad categorias
        
      },
      error: (error) => {
        console.error('La carga de categorías falló completamente después del catch.', error);
      },
      complete: () => {}
    });
  }


  abrirModalAgregarVacante(): void {
    // --- Reinicializa vacanteSeleccionada con los NUEVOS NOMBRES de propiedades ---
    this.vacanteSeleccionada = {
        idVacantes: undefined,
        nomVacante: '',
        descripVacante: '',
        salario: 0,   
        expMinima: '',
        cargoVacante: '',
        catVacId: undefined, 
        
    };
     
  }

  // Recibe vacante (que ahora tiene las nuevas propiedades)
  editarVacante(vacante: Vacante): void {
     
     this.vacanteSeleccionada = { ...vacante };
     
  }

  // Recibe vacante (que ahora tiene las nuevas propiedades)
  confirmDeleteVacante(vacante: Vacante): void {
    // --- Verifica el ID usando el NUEVO nombre: idVacantes ---
    if (vacante.idVacantes === undefined || vacante.idVacantes === null) {
      console.error('Error: No tiene ID válido para eliminar.');
      Swal.fire('Error', 'Datos de vacante inválidos.', 'error');
      return;
    }
    Swal.fire({
      // --- Usa el NUEVO nombre para el nombre en el mensaje: nomVacante ---
      title: `¿Eliminar "${vacante.nomVacante || 'seleccionada'}"?`,
      text: 'Esta acción no se puede deshacer.', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar',
      customClass: { confirmButton: 'btn btn-danger', cancelButton: 'btn btn-secondary' }, buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        // --- Llama al servicio con el NUEVO ID: idVacantes ---
        this.vacanteService.deleteVacante(vacante.idVacantes!).pipe( // Asegúrate de que deleteVacante en el servicio acepte number|string según el tipo de idVacantes
          catchError(error => {
            console.error('Error al eliminar vacante:', error);
            const apiErrorMessage = error.error?.message || error.message || 'Error desconocido.';
            Swal.fire('Error', `No se pudo eliminar. ${apiErrorMessage}`, 'error');
            return throwError(() => new Error(error.message || 'Error desconocido al eliminar vacante'));
          })
        ).subscribe({
          next: () => {
            // --- Usa el NUEVO nombre para el nombre en el mensaje: nomVacante ---
            Swal.fire('¡Eliminada!', `La vacante "${vacante.nomVacante || ''}" fue eliminada.`, 'success');
            this.cargarVacantes();
          },
          error: (error) => { console.error('La eliminación falló después del catch.', error); },
          complete: () => {}
        });
      }
    });
  }

  // Guarda (crear o actualizar) vacante
  guardarVacante(): void {
    
    if (!this.vacanteSeleccionada.nomVacante || this.vacanteSeleccionada.catVacId === undefined || this.vacanteSeleccionada.catVacId === null) {
      Swal.fire('Error', 'El nombre de la vacante y la categoría son obligatorios.', 'error'); 
      return;
    }

    let request$; 
    let successMessage = '';
    let errorMessage = '';

    // --- Decidir si es actualizar (tiene idVacantes) o crear (no tiene idVacantes) ---
    if (this.vacanteSeleccionada.idVacantes !== undefined && this.vacanteSeleccionada.idVacantes !== null) {
      // Si tiene idVacantes, es una actualización
      request$ = this.vacanteService.updateVacante(this.vacanteSeleccionada); // Llama actualizar con el objeto completo
      successMessage = '¡Actualizada!'; errorMessage = 'No se pudo actualizar.';
    } else {
      // Si NO tiene idVacantes, es una creación
      // Crea una copia sin idVacantes si tu API no lo espera al crear
      const { idVacantes, ...vacanteParaCrear } = this.vacanteSeleccionada;
      request$ = this.vacanteService.createVacante(vacanteParaCrear as Vacante); // Llama crear
      successMessage = '¡Creada!'; errorMessage = 'No se pudo crear.';
    }

    // Ejecutar la petición y manejar respuesta
    request$.pipe(
        catchError(error => {
            console.error('Error al guardar vacante:', error);
            const apiErrorMessage = error.error?.message || error.message || 'Error desconocido.';
            Swal.fire('Error', `${errorMessage} ${apiErrorMessage}`, 'error');
            return throwError(() => new Error(error.message || `Error desconocido al guardar vacante`));
        })
    ).subscribe({
        next: (responseVacante) => {
          Swal.fire(successMessage, `La vacante ha sido guardada.`, 'success');

          if (
            this.vacanteSeleccionada.idVacantes === undefined ||
            this.vacanteSeleccionada.idVacantes === null
          ) {
            this.vacanteSeleccionada = {
              idVacantes: undefined,
              nomVacante: '',
              descripVacante: '',
              salario: 0,
              expMinima: '',
              cargoVacante: '',
              catVacId: undefined, // Reinicializa catVacId también
            };
          }
          const modalElement = document.getElementById('agregarVacanteModal');
          if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance?.hide();
          }

          this.cargarVacantes();
        },
        error: (error) => { console.error('La petición de guardar falló después del catch.', error); },
        complete: () => {}
    });
  }
  get vacantesFiltradas(): Vacante[] {
    const vacantesFiltradas = this.vacantes.filter(v => {
      const filtro = this.filtroNombreVacante.toLowerCase();
      return (
        v.nomVacante?.toLowerCase().includes(filtro) ||
        v.cargoVacante?.toLowerCase().includes(filtro)
      );
    });

    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return vacantesFiltradas.slice(inicio, fin);
  }
  get totalPaginas(): number {
    const totalItems = this.vacantes.filter(v => {
      const filtro = this.filtroNombreVacante.toLowerCase();
      return (
        v.nomVacante?.toLowerCase().includes(filtro) ||
        v.cargoVacante?.toLowerCase().includes(filtro)
      );
    }).length;

    return Math.ceil(totalItems / this.itemsPorPagina);
  }

 
  get paginasPaginacion(): (number | string)[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const paginas: (number | string)[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        paginas.push(i);
      }
    } else {
      if (actual <= 3) {
        paginas.push(1, 2, 3, 4, '...', total);
      } else if (actual >= total - 2) {
        paginas.push(1, '...', total - 3, total - 2, total - 1, total);
      } else {
        paginas.push(1, '...', actual - 1, actual, actual + 1, '...', total);
      }
    }

    return paginas;
  }

  generarPaginacion(): void {
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    const paginas: (number | string)[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) paginas.push(i);
    } else {
      if (actual <= 3) {
        paginas.push(1, 2, 3, 4, '...', total);
      } else if (actual >= total - 2) {
        paginas.push(1, '...', total - 3, total - 2, total - 1, total);
      } else {
        paginas.push(1, '...', actual - 1, actual, actual + 1, '...', total);
      }
    }

    this.paginas = paginas;
  }

  cambiarPagina(pagina: number | string): void {
    if (typeof pagina === 'number' && pagina !== this.paginaActual) {
      this.paginaActual = pagina;
      this.generarPaginacion();
    }
  }





}