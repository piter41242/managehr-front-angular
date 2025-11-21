import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuComponent } from '../menu/menu.component';
import { HorasExtraJefeService } from '../../services/horasextra-jefe.service';
import { SolicitudHorasExtraJefe, RespuestaSolicitudHorasExtra } from '../../models/solicitud-horasextra-jefe';

@Component({
  selector: 'app-horasextra-jefe',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuComponent],
  templateUrl: './horasextra-jefe.component.html',
  styleUrl: './horasextra-jefe.component.scss'
})
export class HorasExtraJefeComponent implements OnInit {
  usuario: any = {};
  solicitudes: SolicitudHorasExtraJefe[] = [];
  solicitudesFiltradas: SolicitudHorasExtraJefe[] = [];
  loading = false;
  error = '';
  filtroEstado = 'todos';
  terminoBusqueda = '';
  estadisticas: any = {};
  solicitudSeleccionada: SolicitudHorasExtraJefe | null = null;
  comentario = '';

  constructor(private horasExtraJefeService: HorasExtraJefeService) {}

  ngOnInit(): void {
    const userFromLocal = localStorage.getItem('usuario');
    if (userFromLocal) {
      this.usuario = JSON.parse(userFromLocal);
      //console.log('Usuario logueado:', this.usuario);
    }
    this.cargarSolicitudes();
    this.cargarEstadisticas();
  }

  cargarSolicitudes(): void {
    this.loading = true;
    this.error = '';
    
    this.horasExtraJefeService.obtenerSolicitudesHorasExtra().subscribe({
      next: (data) => {
        this.solicitudes = data;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las solicitudes de horas extra';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  cargarEstadisticas(): void {
    this.horasExtraJefeService.obtenerEstadisticas().subscribe({
      next: (data) => {
        this.estadisticas = data;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
      }
    });
  }

  aplicarFiltros(): void {
    let filtradas = [...this.solicitudes];

    // Filtrar por estado
    if (this.filtroEstado !== 'todos') {
      filtradas = filtradas.filter(s => s.estado === this.filtroEstado);
    }

    // Filtrar por término de búsqueda (nombre o documento)
    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.toLowerCase();
      filtradas = filtradas.filter(s => 
        s.empleado?.nombre?.toLowerCase().includes(termino) ||
        s.empleado?.apellido?.toLowerCase().includes(termino) ||
        s.empleado?.numDocumento?.toString().includes(termino)
      );
    }

    this.solicitudesFiltradas = filtradas;
  }

  onFiltroEstadoChange(): void {
    this.aplicarFiltros();
  }

  onBusquedaChange(): void {
    this.aplicarFiltros();
  }

  aprobarSolicitud(solicitud: SolicitudHorasExtraJefe): void {
    if (!solicitud.idHorasExtra) return;

    this.horasExtraJefeService.actualizarEstado(solicitud.idHorasExtra, 'Aprobado').subscribe({
      next: () => {
        this.cargarSolicitudes();
        this.cargarEstadisticas();
        this.comentario = '';
        this.solicitudSeleccionada = null;
      },
      error: (err) => {
        this.error = 'Error al aprobar la solicitud';
        console.error('Error:', err);
      }
    });
  }

  rechazarSolicitud(solicitud: SolicitudHorasExtraJefe): void {
    if (!solicitud.idHorasExtra) return;

    this.horasExtraJefeService.actualizarEstado(solicitud.idHorasExtra, 'Rechazado').subscribe({
      next: () => {
        this.cargarSolicitudes();
        this.cargarEstadisticas();
        this.comentario = '';
        this.solicitudSeleccionada = null;
      },
      error: (err) => {
        this.error = 'Error al rechazar la solicitud';
        console.error('Error:', err);
      }
    });
  }

  seleccionarSolicitud(solicitud: SolicitudHorasExtraJefe): void {
    this.solicitudSeleccionada = solicitud;
  }

  cancelarAccion(): void {
    this.solicitudSeleccionada = null;
    this.comentario = '';
  }

  getEstadoClass(estado: string | undefined): string {
    switch ((estado || '').toLowerCase()) {
      case 'pendiente': return 'badge-warning';
      case 'aprobado': return 'badge-success';
      case 'rechazado': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  getEstadoText(estado: string | undefined): string {
    switch ((estado || '').toLowerCase()) {
      case 'pendiente': return 'Pendiente';
      case 'aprobado': return 'Aprobado';
      case 'rechazado': return 'Rechazado';
      default: return 'Desconocido';
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }


  getHoras(solicitud: SolicitudHorasExtraJefe): number {
    return solicitud.nHorasExtra;
  }
} 