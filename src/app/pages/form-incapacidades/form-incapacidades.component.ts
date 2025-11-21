import { Component, OnInit } from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { SolicitudesIncapacidadService } from '../../services/solicitudes-incapacidad.service';
import { ContratosService } from 'src/app/services/contratos.service';

interface IncapacidadRequestDisplay {
  idIncapacidad?: number;
  archivo: File | null;
  fechaInicio: string;
  fechaFinal: string;
  contratoId?: number | null;
}

@Component({
  selector: 'app-form-incapacidades',
  standalone: true,
  imports: [
    MenuComponent,
    FormsModule,
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './form-incapacidades.component.html',
  styleUrls: ['./form-incapacidades.component.scss']
})
export class FormIncapacidadesComponent implements OnInit {
  archivo: File | null = null;
  fechaInicio: string = '';
  fechaFinal: string = '';
  contratoId: number | null = null;
  solicitudesIncapacidades: IncapacidadRequestDisplay[] = [];

  constructor(
    private http: HttpClient,
    private solicitudesIncapacidadService: SolicitudesIncapacidadService,
    private contratosService: ContratosService
  ) {}

  ngOnInit(): void {
    this.obtenerContratoId();
  }

  obtenerContratoId(): void {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const numDocumento =
      usuario.perfil?.usuarioNumDocumento ??
      usuario.perfil?.numDocumento ??
      usuario.numDocumento;

    if (!numDocumento) {
      Swal.fire('Error', 'No se pudo identificar al usuario.', 'error');
      return;
    }

    this.contratosService.obtenerContratoPorDocumento(numDocumento).subscribe({
      next: (contrato) => {
        if (contrato) {
          this.contratoId = contrato.idContrato;
          this.obtenerSolicitudesIncapacidades();
        } else {
          Swal.fire('Error', 'No se encontró contrato para el usuario.', 'error');
        }
      },
      error: () => {
        Swal.fire('Error', 'No se pudo obtener el contrato del usuario.', 'error');
      }
    });
  }

  obtenerSolicitudesIncapacidades(): void {
    this.solicitudesIncapacidadService.obtenerSolicitudesIncapacidadUsuario().subscribe({
      next: (solicitudes) => {
        this.solicitudesIncapacidades = solicitudes;
      },
      error: () => {
        this.solicitudesIncapacidades = [];
      }
    });
  }

  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.archivo = element.files[0];
      console.log('Archivo seleccionado:', this.archivo);
    }
  }

  enviarSolicitud(): void {
    if (this.contratoId === null) {
      Swal.fire('Error', 'No se encontró el contrato asociado al usuario.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('fechaInicio', this.fechaInicio);
    formData.append('fechaFinal', this.fechaFinal);
    formData.append('contratoId', this.contratoId.toString());

    if (this.archivo) {
      formData.append('archivo', this.archivo, this.archivo.name);
    }

    this.solicitudesIncapacidadService.enviarSolicitudIncapacidad(formData).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Solicitud de incapacidad enviada con éxito.', 'success');
        this.limpiarFormulario();
        this.obtenerSolicitudesIncapacidades();
      },
      error: () => {
        Swal.fire('Error', 'Error al enviar la solicitud de incapacidad.', 'error');
      }
    });
  }

  limpiarFormulario(): void {
    this.archivo = null;
    this.fechaInicio = '';
    this.fechaFinal = '';
    const fileInput = document.getElementById('archivo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
