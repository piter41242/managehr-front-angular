import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuComponent } from '../../menu/menu.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FilterNamePipe } from 'src/app/shared/filter-name.pipe';
import { Areas, AreaService } from 'src/app/services/area.service';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-area',
  imports: [
    CommonModule,
    FormsModule,
    MenuComponent,
    NgxPaginationModule,
    FilterNamePipe,
  ],
  templateUrl: './area.component.html',
  styleUrl: './area.component.scss',
})
export class AreaComponent {
  areas: Areas[] = [];
  jefesPersonal: any[] = [];
  filtroNombre: string = '';
  area: any = {};
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 5;
  usuario: any = {};
  areaSeleccionada: Areas = {
    idArea: 0,
    nombreArea: '',
    jefePersonal: '',
    idJefe: 0,
    estado: 0,
  };
  constructor(
    private areaService: AreaService,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    const userFromLocal = localStorage.getItem('usuario');
    if (userFromLocal) {
      this.usuario = JSON.parse(userFromLocal);
    }
    this.areaService.obtenerAreas().subscribe({
      next: (data) => {
        this.areas = data;
        this.totalPages = Math.ceil(this.areas.length / this.itemsPerPage);
      },
    });
    this.areaService.getJefesDePersonal().subscribe({
      next: (res) => {
        this.jefesPersonal = res.jefes;
      },
      error: (err) => {
        console.error('Error al cargar jefes de personal:', err);
      },
    });
    this.calcularTotalPages();
  }
  calcularTotalPages(): void {
    const filtrados = this.areas.filter((a) =>
      a.nombreArea.toLowerCase().includes(this.filtroNombre.toLowerCase())
    );
    this.totalPages = Math.ceil(filtrados.length / this.itemsPerPage);
  }
  confirmDelete(idArea: number): void {
    this.areaService.obtenerAreaId(idArea).subscribe({
      next: (res) => {
        const areaData = res.area; // ← correcto según tu backend
        if (!areaData) {
          Swal.fire('Error', 'No se encontró información del área.', 'error');
          return;
        }

        Swal.fire({
          title: `¿Eliminar el área "${areaData.nombreArea}"?`,
          text: 'Esta acción no se puede deshacer.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
        }).then((result) => {
          if (result.isConfirmed) {
            this.areaService.eliminarAreaId(areaData.idArea).subscribe({
              next: () => {
                Swal.fire({
                  title: 'Eliminado',
                  text: `${areaData.nombreArea} fue eliminado correctamente.`,
                  icon: 'success',
                  confirmButtonText: 'Aceptar',
                }).then(() => {
                  location.reload(); // o this.cargarAreas();
                });
              },
              error: (err) => {
                console.error('Error al eliminar el área:', err);
                Swal.fire('Error', 'No se pudo eliminar el área.', 'error');
              },
            });
          }
        });
      },
      error: (err) => {
        console.error('Error al buscar el área:', err);
        Swal.fire(
          'Error',
          'No se pudo obtener la información del área.',
          'error'
        );
      },
    });
  }

  get areasPaginados(): Areas[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.areas.slice(start, start + this.itemsPerPage);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.currentPage = pagina;
    }
  }
  agregarArea(): void {
    // Verifica primero si el usuario existe
    this.areaService.obtenerNombre(this.areaSeleccionada.nombreArea).subscribe({
      next: (res) => {
        const jefe = this.jefesPersonal.find(
          (j) => j.id == this.areaSeleccionada.idJefe
        );

        const jefeNombreCompleto = jefe?.perfil
          ? `${jefe.perfil.primerNombre} ${jefe.perfil.primerApellido}`
          : '';

        const formData = new FormData();
        formData.append('nombreArea', this.areaSeleccionada.nombreArea);
        formData.append(
          'jefePersonal',
          jefe?.perfil
            ? `${jefe.perfil.primerNombre} ${jefe.perfil.primerApellido}`
            : ''
        );

        formData.append('idJefe', this.areaSeleccionada.idJefe.toString());
        formData.append('estado', this.areaSeleccionada.estado.toString());
        
        this.areaService.agregarArea(formData).subscribe({
          next: () => {
            Swal.fire({
              title: '¡OK!',
              text: `El area para ${this.areaSeleccionada.nombreArea} fue creado exitosamente.`,
              icon: 'success',
              confirmButtonText: 'Aceptar',
            }).then(() => {
              location.reload(); // o this.cargarareas() si no quieres recargar
            });
          },
          error: (err) => {
            console.error('Error al guardar:', err);
            Swal.fire('¡ERROR!', 'No se pudo crear el area.', 'error');
          },
        });
      },
      error: (err) => {
        console.error('Error al buscar el area:', err);
        Swal.fire(
          'Error',
          'No se encontró el area. Verifique por nombre.',
          'error'
        );
      },
    });
  }
  abrirModalAgregar(): void {
    this.areaSeleccionada = {
      idArea: 0,
      nombreArea: '',
      jefePersonal: '',
      idJefe: 0,
      estado: 1,
    };
  }
  editarArea(area: any) {
    this.areaSeleccionada = { ...area };
  }
  actualizarArea(): void {
    const jefe = this.jefesPersonal.find(
      (j) => j.id == this.areaSeleccionada.idJefe
    ); // usa == por si llega como string
    this.areaSeleccionada.jefePersonal = jefe?.perfil
      ? jefe.perfil.primerNombre + ' ' + jefe.perfil.primerApellido
      : '';

    // Valida que jefePersonal no quede vacío
    if (!this.areaSeleccionada.jefePersonal) {
      Swal.fire(
        'Error',
        'Debe seleccionar un jefe de personal válido.',
        'error'
      );
      return;
    }

    const datos = {
      nombreArea: this.areaSeleccionada.nombreArea,
      jefePersonal: this.areaSeleccionada.jefePersonal,
      idJefe: Number(this.areaSeleccionada.idJefe),
      estado: this.areaSeleccionada.estado,
    };

    this.areaService
      .actualizarArea(this.areaSeleccionada.idArea, datos)
      .subscribe({
        next: () => {
          Swal.fire({
            title: '¡Actualizado!',
            text: 'El área fue editada exitosamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          }).then(() => {
            location.reload();
          });
        },
        error: (err) => {
          console.error('Error al actualizar área:', err);
          Swal.fire({
            title: '¡Error!',
            text: 'No se pudo actualizar el área.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }

  actualizarNombreJefe() {
    const jefe = this.jefesPersonal.find(
      (j) => j.idJefe === this.areaSeleccionada.idJefe
    );
    this.areaSeleccionada.jefePersonal = jefe ? jefe.nombreCompleto : '';
  }

  getNombreEstado(estado: number): string {
    switch (estado) {
      case 1:
        return 'Activo';
      case 2:
        return 'Inactivo';
      case 3:
        return 'Suspendido';
      default:
        return 'Desconocido';
    }
  }

  getClaseEstado(estado: number): string {
    switch (estado) {
      case 1:
        return 'badge bg-success';
      case 2:
        return 'badge bg-warning text-dark';
      case 3:
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }
  get paginasVisibles(): number[] {
    const paginas: number[] = [];
    const total = this.totalPages;
    const actual = this.currentPage;

    if (total <= 10) {
      for (let i = 1; i <= total; i++) {
        paginas.push(i);
      }
    } else {
      paginas.push(1);

      if (actual > 5) {
        paginas.push(-1); // "..."
      }

      const start = Math.max(2, actual - 2);
      const end = Math.min(total - 1, actual + 2);

      for (let i = start; i <= end; i++) {
        paginas.push(i);
      }

      if (actual < total - 4) {
        paginas.push(-1); // "..."
      }

      paginas.push(total);
    }

    return paginas;
  }
}
