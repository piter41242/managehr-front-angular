import { Component, OnInit } from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';

import {
  SolicitudesVacacionesService,
  SolicitudVacaciones
} from '../../services/solicitudes-vacaciones.service';

@Component({
  selector: 'app-formvacaciones',
  standalone: true,
  imports: [
    MenuComponent,
    FormsModule,
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './formvacaciones.component.html',
  styleUrls: ['./formvacaciones.component.scss']
})
export class FormvacacionesComponent implements OnInit {
  motivo       = '';
  fechaInicio  = '';
  fechaFinal   = '';
  dias         = 0;
  contratoId: number | null = null;

  // Aquí se almacenarán solo las solicitudes de este usuario
  solicitudesVacaciones: SolicitudVacaciones[] = [];

  constructor(
    private http: HttpClient,
    private solicitudesVacacionesService: SolicitudesVacacionesService
  ) {}

  ngOnInit(): void {
    // Primero cargamos el contrato
    this.obtenerContratoId();
    // Luego cargamos las solicitudes que ya existan
    this.cargarMisSolicitudes();
  }

  obtenerContratoId(): void {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    console.log('Usuario cargado:', usuario);

    const numDocumento =
      usuario.perfil?.usuarioNumDocumento ??
      usuario.perfil?.numDocumento ??
      usuario.numDocumento;

    if (!numDocumento) {
      Swal.fire('Error', 'No se pudo identificar al usuario.', 'error');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http
      .get<{ contrato: { idContrato: number } }>(
        `http://127.0.0.1:8000/api/contrato-usuario/${numDocumento}`,
        { headers }
      )
      .subscribe({
        next: (res) => {
          console.log('Respuesta del backend al buscar contrato:', res);
          this.contratoId = res.contrato?.idContrato ?? null;

          if (!this.contratoId) {
            Swal.fire('Error', 'No se encontró contrato válido para el usuario.', 'error');
          }
        },
        error: (err) => {
          console.error('Error al obtener contrato:', err);
          Swal.fire('Error', 'No se encontró contrato para el usuario.', 'error');
        }
      });
  }

  /** Trae solo las solicitudes previamente enviadas por este usuario */
  cargarMisSolicitudes(): void {
    this.solicitudesVacacionesService.obtenerSolicitudesUsuario()
      .subscribe({
        next: (data) => {
          console.log('Solicitudes recibidas:', data);
          this.solicitudesVacaciones = data;
        },
        error: (err) => {
          console.error('Error al cargar solicitudes de usuario:', err);
          // No interrumpimos el flujo si falla; solo mostramos en consola.
        }
      });
  }

  /** Calcula los días incluyendo ambos extremos */
  calcularDias(): void {
    if (this.fechaInicio && this.fechaFinal) {
      const inicio = new Date(this.fechaInicio);
      const fin    = new Date(this.fechaFinal);
      const diffMs = fin.getTime() - inicio.getTime();
      this.dias = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    } else {
      this.dias = 0;
    }
  }

  enviarSolicitud(): void {
    this.calcularDias();

    if (
      !this.motivo.trim() ||
      !this.fechaInicio ||
      !this.fechaFinal ||
      this.dias <= 0 ||
      this.contratoId === null
    ) {
      Swal.fire('Error', 'Todos los campos deben estar completos y válidos.', 'error');
      return;
    }

    const solicitud: SolicitudVacaciones = {
      motivo: this.motivo,
      fechaInicio: this.fechaInicio,
      fechaFinal: this.fechaFinal,
      dias: this.dias,
      contratoId: this.contratoId
    };

    console.log('Datos enviados:', solicitud);

    this.solicitudesVacacionesService.enviarSolicitud(solicitud).subscribe({
      next: (response) => {
        // Añadimos la nueva solicitud al listado que ya teníamos
        this.solicitudesVacaciones.unshift(response);
        Swal.fire('Éxito', 'Solicitud de vacaciones enviada correctamente.', 'success');
        this.limpiarFormulario();
      },
      error: (error) => {
        console.error('Error al enviar solicitud:', error);
        Swal.fire(
          'Error',
          error.status === 422
            ? 'Verifica los campos del formulario.'
            : 'Ocurrió un error al enviar la solicitud.',
          'error'
        );
      }
    });
  }

  limpiarFormulario(): void {
    this.motivo      = '';
    this.fechaInicio = '';
    this.fechaFinal  = '';
    this.dias        = 0;
  }

  /** Determina si el botón debe estar habilitado */
  get puedeEnviar(): boolean {
    return (
      this.motivo.trim().length > 0 &&
      this.fechaInicio !== '' &&
      this.fechaFinal !== '' &&
      this.dias > 0 &&
      this.contratoId !== null
    );
  }
}
