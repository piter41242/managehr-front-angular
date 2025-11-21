import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { NgxPaginationModule } from 'ngx-pagination';
import {
  TrazabilidadService,
  Trazabilidad,
} from 'src/app/services/trazabilidad.service';
import Swal from 'sweetalert2';
import { MenuComponent } from '../../menu/menu.component';
import { Observable } from 'rxjs';
styleUrls: ['./trazabilidad.component.scss'];

@Component({
  selector: 'app-trazabilidad',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, MenuComponent],
  templateUrl: './trazabilidad.component.html',
  styleUrls: ['./trazabilidad.component.scss'],
})
export class TrazabilidadComponent implements OnInit {
  trazabilidad: Trazabilidad[] = [];

  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;
  usuario: any = {};

  constructor(
    private trazabilidadService: TrazabilidadService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userFromLocal = localStorage.getItem('usuario');
    if (userFromLocal) {
      this.usuario = JSON.parse(userFromLocal);
    }
    this.cargarTrazabilidad();
  }

  // Cuando cambia el filtro, recalcula totalPages
  set filtro(valor: string) {
    this._filtro = valor;
    this.totalPages = Math.ceil(
      this.trazabilidadFiltrada.length / this.itemsPerPage
    );
    this.currentPage = 1;
  }
  get filtro(): string {
    return this._filtro;
  }
  private _filtro: string = '';

  cargarTrazabilidad(): void {
    this.trazabilidadService.obtenerTrazabilidad().subscribe({
      next: (data) => {
        
        this.trazabilidad = data;
        this.totalPages = Math.ceil(
          this.trazabilidad.length / this.itemsPerPage
        );
      },
      error: (err) => {
        console.error('Error al cargar trazabilidad', err);
      },
    });
  }

  confirmDelete(id: number): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.trazabilidadService.eliminarTrazabilidad(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Registro eliminado con éxito.', 'success');
            this.cargarTrazabilidad();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el registro.', 'error');
          },
        });
      }
    });
  }

  get trazabilidadFiltrada(): Trazabilidad[] {
    const filtro = this.filtro.toLowerCase();
    return this.trazabilidad.filter(
      (t) =>
        t.numDocumento.toString().includes(filtro) ||
        t.usuarionuevo.toLowerCase().includes(filtro)
    );
  }

  get trazabilidadPaginada(): Trazabilidad[] {
    const filtrados = this.trazabilidadFiltrada;
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return filtrados.slice(start, start + this.itemsPerPage);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.currentPage = pagina;
    }
  }
}
