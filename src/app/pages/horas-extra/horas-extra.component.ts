import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuComponent } from '../menu/menu.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HorasextraService } from '../../services/horasextra.service';  // Ruta correcta para el servicio

interface HoraExtra {
  id: number;
  nombre: string;
  cargo: string;
  fecha: string;
  horaInicio: string;
  horaFinal: string;
  totalHoras: number;
  estado: string;
  isExpanded?: boolean;
}

@Component({
  selector: 'app-horas-extra',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuComponent, FontAwesomeModule],
  templateUrl: './horas-extra.component.html',
  styleUrls: ['./horas-extra.component.scss']
})
export class HorasExtraComponent implements OnInit {
  horasExtras: HoraExtra[] = [
    { id: 1, nombre: 'John Michael', cargo: 'Asesor', fecha: '2024-07-15', horaInicio: '17:00', horaFinal: '20:00', totalHoras: 3, estado: 'completado' },
    { id: 2, nombre: 'Laurent Perrier', cargo: 'Programador', fecha: '2024-07-17', horaInicio: '18:00', horaFinal: '22:00', totalHoras: 4, estado: 'pendiente' }
  ];

  modalVisible: boolean = false;
  horaExtraEditada: HoraExtra = {} as HoraExtra;
  nuevaHoraExtra: HoraExtra = {} as HoraExtra;
  mostrarAgregarModalHorasExtra: boolean = false;
  isLargeScreen: boolean = true;

  constructor(private horasExtraService: HorasextraService) { }  // Inyección del servicio

  ngOnInit(): void {
    this.horasExtras = this.horasExtras.map(item => ({
      ...item,
      isExpanded: false
    }));
    this.onResize();
  }

  @HostListener('window:resize', [])
  onResize() {
    this.isLargeScreen = window.innerWidth > 1045;
  }

  toggleAcordeon(item: HoraExtra): void {
    item.isExpanded = !item.isExpanded;
  }

  agregarHorasExtras(): void {
    this.nuevaHoraExtra = {} as HoraExtra;
    this.mostrarAgregarModalHorasExtra = true;
  }

  cerrarAgregarModalHorasExtra(): void {
    this.mostrarAgregarModalHorasExtra = false;
    this.nuevaHoraExtra = {} as HoraExtra;
  }

  guardarNuevaHoraExtra(): void {
    const data = {
      descrip: 'Horas extra registradas desde frontend',
      fecha: this.nuevaHoraExtra.fecha,
      nHorasExtra: this.nuevaHoraExtra.totalHoras,
      tipoHorasid: 1,          // Cambia esto si tienes select
      contratoId: 1            // Cambia esto si tienes usuario logueado o select
    };

    this.horasExtraService.create(data).subscribe({
      next: () => {
        this.cargarHorasExtras();
        this.cerrarAgregarModalHorasExtra();
      },
      error: (err) => {
        console.error('Error al guardar:', err);
      }
    });
  }

  cargarHorasExtras(): void {
    this.horasExtraService.getAll().subscribe({
      next: (data) => {
        this.horasExtras = data;
      },
      error: (err) => {
        console.error('Error al cargar horas extras:', err);
      }
    });
  }

  editarHorasExtras(horaExtra: HoraExtra): void {
    this.horaExtraEditada = { ...horaExtra };
    this.modalVisible = true;
  }

  cancelarEdicion(): void {
    this.modalVisible = false;
  }

  guardarEdicion(): void {
    const index = this.horasExtras.findIndex(h => h.id === this.horaExtraEditada.id);
    if (index !== -1) {
      const originalIsExpanded = this.horasExtras[index].isExpanded;
      this.horasExtras[index] = {
        ...this.horaExtraEditada,
        isExpanded: originalIsExpanded
      };
    }
    this.modalVisible = false;
  }

  eliminarHorasExtras(horaExtra: HoraExtra): void {
    const confirmado = confirm(`¿Estás seguro de eliminar las horas extras de ${horaExtra.nombre} (${horaExtra.fecha})?`);
    if (confirmado) {
      this.horasExtraService.delete(horaExtra.id).subscribe({
        next: () => {
          this.horasExtras = this.horasExtras.filter(h => h.id !== horaExtra.id);
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
        }
      });
    }
  }

  generarReporte(): void {
    console.log('Generando reporte de horas extras...');
    alert('Generando reporte de horas extras...');
  }
}
