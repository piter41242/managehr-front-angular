import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuComponent } from "../menu/menu.component";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-incapacidades',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuComponent, FontAwesomeModule],
  templateUrl: './incapacidades.component.html',
  styleUrls: ['./incapacidades.component.scss']
})
export class IncapacidadesComponent implements OnInit {

  incapacidades: any[] = [];
  nuevaIncapacidad: any = {};
  incapacidadEditada: any = {};
  modalAbierto: boolean = false;
  mostrarAgregarModalIncapacidad: boolean = false;
  isLargeScreen: boolean = true;

  constructor() {}

  ngOnInit(): void {
    // Simulamos datos iniciales (puedes reemplazar con datos reales)
    

    // Agregamos isExpanded a cada incapacidad
    this.incapacidades = this.incapacidades.map(incapacidad => ({
      ...incapacidad,
      isExpanded: false
    }));

    this.onResize(); // Para detectar tamaño inicial
  }

  @HostListener('window:resize', [])
  onResize() {
    this.isLargeScreen = window.innerWidth > 1140;
  }

  toggleAcordeon(incapacidad: any): void {
    incapacidad.isExpanded = !incapacidad.isExpanded;
  }

  agregarIncapacidad(): void {
    this.nuevaIncapacidad = {};
    this.mostrarAgregarModalIncapacidad = true;
  }

  cerrarAgregarModalIncapacidad(): void {
    this.mostrarAgregarModalIncapacidad = false;
  }

  guardarNuevaIncapacidad(): void {
    const nueva = {
      ...this.nuevaIncapacidad,
      id: Date.now(), // ID temporal
      isExpanded: false
    };
    this.incapacidades.push(nueva);
    this.cerrarAgregarModalIncapacidad();
  }

  editarIncapacidad(incapacidad: any): void {
    this.incapacidadEditada = { ...incapacidad };
    this.modalAbierto = true;
  }

  cancelarEdicion(): void {
    this.modalAbierto = false;
  }

  guardarIncapacidad(): void {
    const index = this.incapacidades.findIndex(i => i.id === this.incapacidadEditada.id);
    if (index !== -1) {
      this.incapacidades[index] = {
        ...this.incapacidadEditada,
        isExpanded: this.incapacidades[index].isExpanded // conservar estado del acordeón
      };
    }
    this.cancelarEdicion();
  }

  eliminarIncapacidad(id: number): void {
    this.incapacidades = this.incapacidades.filter(i => i.id !== id);
  }

  generarReporte(): void {
    // Aquí puedes implementar la lógica real de generación de PDF/Excel/etc.
    console.log('Generar reporte de incapacidades');
  }
}
