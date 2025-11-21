import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';
import * as bootstrap from 'bootstrap';

import {
  Categoria,
  CategoriaService,
} from '../../../services/categoria.service';

import { FilterCategoriaPipe } from './filter-categoria';

import { AuthService } from '../../../services/auth.service';
import { MenuComponent } from '../../menu/menu.component';

import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-categoria-vacantes',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuComponent],
  templateUrl: './categoria-vacantes.component.html',
  styleUrls: ['./categoria-vacantes.component.scss'],
})
export class CategoriaVacantesComponent implements OnInit {
  categorias: Categoria[] = [];

  categoriaSeleccionada: Categoria = { nomCategoria: '' };

  usuario: any = {};

  paginaActual: number = 1;
  categoriasPorPagina: number = 5;

  filtroNombre: string = '';

  constructor(
    public authService: AuthService,

    private categoriaService: CategoriaService
  ) {}

  ngOnInit(): void {
    const userFromLocal = localStorage.getItem('usuario');
    if (userFromLocal) {
      this.usuario = JSON.parse(userFromLocal);
    }

    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.categoriaService
      .getCategorias()
      .pipe(
        catchError((error) => {
          Swal.fire('Error', 'No se pudieron cargar las categorías.', 'error');
          return throwError(
            () =>
              new Error(
                error.message || 'Error desconocido al cargar categorías'
              )
          );
        })
      )
      .subscribe({
        next: (data) => {
          this.categorias = data;
        },
        error: (error) => {
          console.error(
            'Suscripción de cargarCategorias completada con error.',
            error
          );
        },
      });
  }

  abrirModalAgregarCategoria(): void {
    this.categoriaSeleccionada = { nomCategoria: '' };
  }

  editarCategoria(categoria: Categoria): void {
    this.categoriaSeleccionada = { ...categoria };
  }

  confirmDeleteCategoria(categoria: Categoria): void {
    if (categoria.idCatVac === undefined) {
      Swal.fire(
        'Error',
        'Datos de categoría inválidos para eliminar.',
        'error'
      );
      return;
    }

    Swal.fire({
      title: `¿Eliminar la categoría "${categoria.nomCategoria}"?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-secondary',
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoriaService
          .deleteCategoria(categoria.idCatVac!)
          .pipe(
            catchError((error) => {
              Swal.fire('Error', 'No se pudo eliminar la categoría.', 'error');
              return throwError(
                () =>
                  new Error(
                    error.message || 'Error desconocido al eliminar categoría'
                  )
              );
            })
          )
          .subscribe({
            next: () => {
              Swal.fire(
                '¡Eliminada!',
                `La categoría "${categoria.nomCategoria}" fue eliminada correctamente.`,
                'success'
              );
              this.cargarCategorias();
            },
            error: (error) => {
              console.error(
                'Suscripción de deleteCategoria completada con error.',
                error
              );
            },
          });
      }
    });
  }

  guardarCategoria(): void {
    if (!this.categoriaSeleccionada.nomCategoria) {
      Swal.fire('Error', 'El nombre de la categoría es obligatorio.', 'error');
      return;
    }

    if (this.categoriaSeleccionada.idCatVac !== undefined) {
      this.categoriaService
        .updateCategoria(this.categoriaSeleccionada)
        .pipe(
          catchError((error) => {
            Swal.fire('Error', 'No se pudo actualizar la categoría.', 'error');
            return throwError(
              () =>
                new Error(
                  error.message || 'Error desconocido al actualizar categoría'
                )
            );
          })
        )
        .subscribe({
          next: (updatedCategoria) => {
            Swal.fire(
              '¡Actualizada!',
              'La categoría fue editada exitosamente.',
              'success'
            ).then(() => {
              window.location.reload(); // 🔁 Recarga después del OK
            });
            this.cargarCategorias();
          },
          error: (error) => {
            console.error(
              'Suscripción de updateCategoria completada con error.',
              error
            );
          },
        });
    } else {
      this.categoriaService
        .createCategoria(this.categoriaSeleccionada)
        .pipe(
          catchError((error) => {
            Swal.fire('Error', 'No se pudo crear la categoría.', 'error');
            return throwError(
              () =>
                new Error(
                  error.message || 'Error desconocido al crear categoría'
                )
            );
          })
        )
        .subscribe({
          next: (newCategoria) => {
            Swal.fire(
              '¡Creada!',
              'La categoría ha sido guardada correctamente.',
              'success'
            ).then(() => {
              window.location.reload(); // 🔁 Recarga después del OK
            });
            this.categoriaSeleccionada = { nomCategoria: '' };
            this.cargarCategorias();
          },
          error: (error) => {
            console.error(
              'Suscripción de createCategoria completada con error.',
              error
            );
          },
        });
    }
  }
  get categoriasFiltradas(): Categoria[] {
    return this.categorias.filter((cat) =>
      cat.nomCategoria.toLowerCase().includes(this.filtroNombre.toLowerCase())
    );
  }

  get categoriasPaginadas(): Categoria[] {
    const inicio = (this.paginaActual - 1) * this.categoriasPorPagina;
    return this.categoriasFiltradas.slice(
      inicio,
      inicio + this.categoriasPorPagina
    );
  }

  get totalPaginas(): number {
    return Math.ceil(
      this.categoriasFiltradas.length / this.categoriasPorPagina
    );
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }
}
