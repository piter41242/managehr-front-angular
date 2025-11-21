import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { HorasService } from '../../services/horas.service';
import { MenuComponent } from '../menu/menu.component';

interface TipoHora {
  idTipoHoras: number;
  nombreTipoHoras: string;
}

interface HorasExtraRequestDisplay {
  idHorasExtra?: number;
  descripcion: string;
  fecha: string;
  tipoHorasId: number;
  nHorasExtra: number;
  contratoId?: number;
}

@Component({
  selector: 'app-form-horas',
  standalone: true,
  imports: [
    MenuComponent,
    FormsModule,
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './form-horas.component.html',
  styleUrls: ['./form-horas.component.scss']
})
export class FormHorasComponent implements OnInit {
  descripcion: string = '';
  fecha: string = '';
  tipoHorasId: number = 1;
  nHorasExtra: number = 0;
  contratoId: number | null = null;
  solicitudesHoras: HorasExtraRequestDisplay[] = [];

  tiposHoras: TipoHora[] = [
    { idTipoHoras: 2, nombreTipoHoras: 'Diurna' },
    { idTipoHoras: 3, nombreTipoHoras: 'Nocturna' },
    { idTipoHoras: 4, nombreTipoHoras: 'Dominical' }
  ];

  constructor(
    private http: HttpClient,
    private horasService: HorasService
  ) {}

  ngOnInit(): void {
    this.obtenerSolicitudesHoras();
  }

  obtenerSolicitudesHoras(): void {
    this.horasService.obtenerSolicitudesHoras().subscribe({
      next: (res: any[]) => {
        this.solicitudesHoras = res;
      },
      error: () => {
        this.solicitudesHoras = [];
      }
    });
  }

  enviarSolicitud(): void {
    if (!this.fecha || !this.descripcion || this.nHorasExtra <= 0 || !this.tipoHorasId) {
      Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
      return;
    }

    const solicitud: HorasExtraRequestDisplay = {
      descripcion: this.descripcion,
      fecha: this.fecha,
      tipoHorasId: this.tipoHorasId,
      nHorasExtra: this.nHorasExtra
    };

    this.horasService.enviarHoras(solicitud).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Solicitud de horas extra enviada correctamente.', 'success');
        this.obtenerSolicitudesHoras();
        this.resetForm();
      },
      error: () => {
        Swal.fire('Error', 'Hubo un problema al enviar la solicitud.', 'error');
      }
    });
  }

  resetForm(): void {
    this.descripcion = '';
    this.fecha = '';
    this.tipoHorasId = 1;
    this.nHorasExtra = 0;
  }

  obtenerNombreTipoHora(id: number): string {
  const tipo = this.tiposHoras.find(t => t.idTipoHoras === id);
  return tipo ? tipo.nombreTipoHoras : `ID ${id}`;
}

}
