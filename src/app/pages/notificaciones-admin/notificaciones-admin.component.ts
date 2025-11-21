import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../menu/menu.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NotificacionesService } from '../../services/notificaciones.service';
import { Notificacion } from '../../services/notificaciones.service';
import { Usuarios } from '../../services/usuarios.service';
import { UsuariosService } from '../../services/usuarios.service';
import { AreaService } from '../../services/area.service';
import { Areas } from '../../services/area.service';
import { Pipe, PipeTransform } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import { SafeUrlPipe } from 'src/app/shared/safe-url.pipe';
import { FilterNamePipe } from 'src/app/shared/filter-name.pipe';
import { FiltroPersonalizadoPipe } from 'src/app/shared/filtro-personalizado.pipe';
import {
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { AuthService } from 'src/app/services/auth.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  registerables,
} from 'chart.js';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

declare var bootstrap: any;
interface NotificationItem {
  id: number;
  name: string;
  description: string;
  date: string;
  extraDetails?: any;
}

@Component({
  selector: 'app-notificaciones-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MenuComponent,
    FontAwesomeModule,
    NgxPaginationModule,
  ],
  templateUrl: './notificaciones-admin.component.html',
  styleUrls: ['./notificaciones-admin.component.scss'],
})
export class NotificacionesAdminComponent implements OnInit {
  notificacionesSinAutorizar: Notificacion[] = [];
  notificacionesAutorizadas: Notificacion[] = [];
  selectedNotification: any = null;
  modalVisible: boolean = false;
  usuario: any = {};
  tienePermiso: boolean = false;
  archivoActual: string | null = null;
  graficoEstado: any;
  notificaciones: Notificacion[] = [];
  filtroNombre: string = '';
  itemsPerPage: number = 5;
  currentPage: number = 1;
  paginaSinAutorizadas: number = 1;
  paginaAutorizadas: number = 1;
  filtroUsuarios: string = '';
  filtroExternos: string = '';
  formhorasextra!: FormGroup;
  archivoSeleccionado!: File | null;
  usuariosExternos: any[] = [];
  usuarios: any[] = [];
  contratos: any[] = [];
  contratoId: any = {};
  contratoNombre: any = {};
  graficoUsuario: Chart | undefined;
  graficoArea: Chart | undefined;
  historialNotificaciones: Notificacion[] = [];
  notificacionSeleccionada: Notificacion | null = null;
  areas: any[] = [];
  paginaHistorial = 1;
  itemsPorPaginaHistorial: number = 5;


  totalPages1: number[] = [];
  constructor(
    private notificacionesService: NotificacionesService,
    private formBuilder: FormBuilder,
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private areaService: AreaService,
    private authService: AuthService
  ) {}


  ngOnInit(): void {
    const userFromLocal = localStorage.getItem('usuario');
    if (userFromLocal) {
      this.usuario = JSON.parse(userFromLocal);
    }
    this.cargarNotificaciones();
    
  }

  cargarNotificaciones(): void {
    forkJoin({
      
      notificaciones: this.notificacionesService.getAll(),
    }).subscribe(({  notificaciones }) => {
      

      const todas = notificaciones.Notificaciones;

      // Rol 1 y 4: Admins - ven todo
      if ([1, 4].includes(this.usuario.rol)) {
        this.notificacionesSinAutorizar = todas.filter((n) => n.estado === 0);
        this.notificacionesAutorizadas = todas.filter((n) => n.estado === 1);
        this.historialNotificaciones = todas.filter((n) => n.estado === 1);
      }
      // Rol 2: Solo del área
      else if (this.usuario.rol === 2) {
        this.notificacionesSinAutorizar = todas.filter(
          (n) => n.estado === 0 && n.areaId === this.usuario.areaId
        );
        this.notificacionesAutorizadas = todas.filter(
          (n) => n.estado === 1 && n.areaId === this.usuario.areaId
        );
        this.historialNotificaciones = todas.filter(
          (n) => n.estado === 1 && n.areaId === this.usuario.areaId
        );
      }
      // Rol 3, 5+: Solo sus propias
      else {
        this.notificacionesSinAutorizar = todas.filter(
          (n) =>
            n.estado === 0 &&
            n.contrato?.hoja_de_vida?.usuario?.numDocumento === this.usuario.perfil.numDocumento
        );

        this.notificacionesAutorizadas = todas.filter(
          (n) =>
            n.estado === 1 &&
            n.contrato?.hoja_de_vida?.usuario?.numDocumento === this.usuario.perfil.numDocumento
        );
        
        this.historialNotificaciones = todas.filter(
          (n) =>
            n.estado === 1 &&
            n.contrato?.hoja_de_vida?.usuario?.numDocumento === this.usuario.perfil.numDocumento
        );
      }
      
    });
  }

  aceptarNotificacion(n: Notificacion): void {
    this.notificacionesService
      .actualizarEstado(n.idNotificacion, 1)
      .subscribe(() => {
        this.cargarNotificaciones();
        Swal.fire({
          icon: 'success',
          title: 'Estado actualizado',
          text: 'La notificación fue aceptada correctamente',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      });
  }

  rechazarNotificacion(n: Notificacion): void {
    this.notificacionesService
      .actualizarEstado(n.idNotificacion, 2)
      .subscribe(() => {
        this.cargarNotificaciones();
      });
  }
  get notificacionesFiltradas() {
    const filtroLower = this.filtroNombre.toLowerCase();

    return this.notificaciones.filter((horasextra) => {
      const usuario = horasextra.usuarioId;

      const usuarioTodos = this.usuario.obtenerUsuarios();
      if (!usuario) return false;

      const nombreCompleto = `${usuarioTodos.primerNombre ?? ''} ${
        usuarioTodos.segundoNombre ?? ''
      } ${usuarioTodos.primerApellido ?? ''} ${
        usuarioTodos.segundoApellido ?? ''
      }`.toLowerCase();
      const documento = usuarioTodos.numDocumento.toString();

      return (
        nombreCompleto.includes(filtroLower) || documento.includes(filtroLower)
      );
    });
  }
  onArchivoSeleccionado(event: any): void {
    this.archivoSeleccionado = event.target.files[0] ?? null;
  }
  verificarPermiso(): boolean {
    return [1, 4].includes(this.usuario?.rol);
  }
  get notificacionesSinAutorizadasFiltradas() {
    return this.notificacionesSinAutorizar.filter((n) =>
      n.detalle?.toLowerCase().includes(this.filtroUsuarios.toLowerCase())
    );
  }

  get notificacionesAutorizadasFiltradas() {
    return this.notificacionesAutorizadas.filter((n) =>
      n.detalle?.toLowerCase().includes(this.filtroExternos.toLowerCase())
    );
  }
  verNotificacion(n: Notificacion): void {
    this.notificacionSeleccionada = n;
    const modal = new bootstrap.Modal(
      document.getElementById('modalVerDetalle')
    );
    modal.show();
  }
  abrirHistorial(): void {
  this.paginaHistorial = 1; // ← esto es clave
  const modal = new bootstrap.Modal(
    document.getElementById('modalHistorial')
  );
  modal.show();
}

  getDocumentoUsuario(id: number): string {
    const usuario = this.usuarios.find((u) => u.usersId === id);

    
    return usuario?.numDocumento?.toString() || 'usuario ya no existe';
  }

  getNombreUsuario(id: number | undefined): string {
    if (!id) return 'Desconocido';
    const usuario = this.usuarios.find((u) => u.usersId === id);
    return usuario
      ? `${usuario.primerNombre ?? ''} ${usuario.primerApellido ?? ''}`.trim()
      : 'Desconocido';
  }

  getNombreArea(id: number | undefined): string {
    if (!id) return 'Sin área';
    const area = this.areas.find((a) => a.idArea === id);
    return area ? area.nombreArea : 'Sin área';
  }
  getNombreUsuarioDesdeContrato(n: Notificacion): string {
   
    const usuario = n?.contrato?.hoja_de_vida?.usuario;
    if (!usuario) return 'Desconocido';
    return `${usuario.primerNombre ?? ''} ${
      usuario.primerApellido ?? ''
    }`.trim();
  }
  getNombreAreaDesdeContrato(n: Notificacion): string {
    
    const area = n?.contrato?.area;
    return area?.nombreArea ?? 'Sin área';
  }
  getEstadoTexto(estado: number): string {
    switch (estado) {
      case 0:
        return 'Leída';
      case 1:
        return 'Nueva';
      case 2:
        return 'Rechazada';
      default:
        return 'Desconocido';
    }
  }

  getEstadoClase(estado: number): string {
    switch (estado) {
      case 0:
        return 'badge bg-secondary'; // gris
      case 1:
        return 'badge bg-success'; // verde
      case 2:
        return 'badge bg-danger'; // rojo
      default:
        return 'badge bg-dark'; // negro
    }
  }
  get notificacionesFiltradasPaginadas(): Notificacion[] {
    // 1. Obtener la lista base según rol
    let base: Notificacion[] = [];

    const todas = [
      ...this.notificacionesSinAutorizar,
      ...this.notificacionesAutorizadas,
      ...this.historialNotificaciones,
    ];

    if ([1, 4].includes(this.usuario.rol)) {
      // Admin o jefe, ven todo
      base = todas;
    } else if (this.usuario.rol === 2) {
      // Solo notificaciones del área
      base = todas.filter((n) => n.areaId === this.usuario.areaId);
    } else {
      // Solo propias
      base = todas.filter((n) => n.usuarioId === this.usuario.id);
    }

    // 2. Aplica filtro por nombre, documento o área
    const filtro = this.filtroNombre.toLowerCase();

    return (
      base
        .filter((n) => {
          // Obtener usuario y área para esta notificación
          const usuario = this.usuarios.find((u) => u.usersId === n.usuarioId);
          const area = this.areas.find((a) => a.idArea === n.areaId);

          const nombreCompleto = usuario
            ? `${usuario.primerNombre ?? ''} ${
                usuario.primerApellido ?? ''
              }`.toLowerCase()
            : '';
          const documento = usuario
            ? usuario.numDocumento?.toString() ?? ''
            : '';
          const nombreArea = area ? area.nombreArea.toLowerCase() : '';

          return (
            nombreCompleto.includes(filtro) ||
            documento.includes(filtro) ||
            nombreArea.includes(filtro)
          );
        })
        // 3. Finalmente paginamos
        .slice(
          (this.currentPage - 1) * this.itemsPerPage,
          this.currentPage * this.itemsPerPage
        )
    );
  }

  get totalItems(): number {
    // igual filtro pero sin slice para saber el total real
    let base: Notificacion[] = [];

    const todas = [
      ...this.notificacionesSinAutorizar,
      ...this.notificacionesAutorizadas,
      ...this.historialNotificaciones,
    ];

    if ([1, 4].includes(this.usuario.rol)) {
      base = todas;
    } else if (this.usuario.rol === 2) {
      base = todas.filter((n) => n.areaId === this.usuario.areaId);
    } else {
      base = todas.filter((n) => n.usuarioId === this.usuario.id);
    }

    const filtro = this.filtroNombre.toLowerCase();

    return base.filter((n) => {
      const usuario = this.usuarios.find((u) => u.usersId === n.usuarioId);
      const area = this.areas.find((a) => a.idArea === n.areaId);

      const nombreCompleto = usuario
        ? `${usuario.primerNombre ?? ''} ${
            usuario.primerApellido ?? ''
          }`.toLowerCase()
        : '';
      const documento = usuario ? usuario.numDocumento?.toString() ?? '' : '';
      const nombreArea = area ? area.nombreArea.toLowerCase() : '';

      return (
        nombreCompleto.includes(filtro) ||
        documento.includes(filtro) ||
        nombreArea.includes(filtro)
      );
    }).length;
  }
}
