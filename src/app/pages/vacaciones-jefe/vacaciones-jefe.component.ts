import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuComponent } from '../menu/menu.component';
import { VacacionesJefeService } from '../../services/vacaciones-jefe.service';
import { SolicitudVacacionesJefe, RespuestaSolicitud } from '../../models/solicitud-vacaciones-jefe';

@Component({
  selector: 'app-vacaciones-jefe',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuComponent],
  templateUrl: './vacaciones-jefe.component.html',
  styleUrl: './vacaciones-jefe.component.scss'
})
export class VacacionesJefeComponent implements OnInit {
  usuario: any = {};
  solicitudes: SolicitudVacacionesJefe[] = [];
  solicitudesFiltradas: SolicitudVacacionesJefe[] = [];
  loading = false;
  error = '';
  filtroEstado = 'todos';
  terminoBusqueda = '';
  estadisticas: any = {};
  solicitudSeleccionada: SolicitudVacacionesJefe | null = null;
  comentario = '';

  constructor(private vacacionesJefeService: VacacionesJefeService) {}

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
    
    this.vacacionesJefeService.obtenerSolicitudesVacaciones().subscribe({
      next: (data) => {
        this.solicitudes = data;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las solicitudes de vacaciones';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  cargarEstadisticas(): void {
    this.vacacionesJefeService.obtenerEstadisticas().subscribe({
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

  aprobarSolicitud(solicitud: SolicitudVacacionesJefe): void {
    if (!solicitud.idVacaciones) return;

    const respuesta: RespuestaSolicitud = {
      idVacaciones: solicitud.idVacaciones,
      estado: 'aprobado',
      comentario: this.comentario
    };

    this.vacacionesJefeService.aprobarSolicitud(respuesta).subscribe({
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

  rechazarSolicitud(solicitud: SolicitudVacacionesJefe): void {
    if (!solicitud.idVacaciones) return;

    const respuesta: RespuestaSolicitud = {
      idVacaciones: solicitud.idVacaciones,
      estado: 'rechazado',
      comentario: this.comentario
    };

    this.vacacionesJefeService.rechazarSolicitud(respuesta).subscribe({
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

  seleccionarSolicitud(solicitud: SolicitudVacacionesJefe): void {
    this.solicitudSeleccionada = solicitud;
  }

  cancelarAccion(): void {
    this.solicitudSeleccionada = null;
    this.comentario = '';
  }

  getEstadoClass(estado: string | undefined): string {
    switch (estado) {
      case 'pendiente': return 'badge-warning';
      case 'aprobado': return 'badge-success';
      case 'rechazado': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  getEstadoText(estado: string | undefined): string {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'aprobado': return 'Aprobado';
      case 'rechazado': return 'Rechazado';
      default: return 'Desconocido';
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  calcularDias(fechaInicio: string, fechaFin: string): number {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Incluir el día de inicio
  }
}
