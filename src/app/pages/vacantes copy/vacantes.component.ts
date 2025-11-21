import { CommonModule } from '@angular/common';
import { MenuComponent } from '../menu/menu.component';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vacantes',
  standalone: true,
  imports: [CommonModule, MenuComponent, FormsModule],
  templateUrl: './vacantes.component.html',
  styleUrls: ['./vacantes.component.scss']
})
export class VacantesComponent {
  vacantes = [
    {
      id: 1,
      titulo: 'Desarrollador Frontend Angular',
      salario: '$8,000,000 COP',
      descripcion: 'Buscamos un desarrollador Frontend con experiencia en Angular.',
      requisitos: [
        '3+ años de experiencia con Angular',
        'HTML5, CSS3, JavaScript',
        'Git',
        'Trabajo en equipo',
        'Inglés intermedio'
      ],
      imagen: 'https://victorroblesweb.es/wp-content/uploads/2017/04/angular4.png'
    },
    {
      id: 2,
      titulo: 'Diseñador UX/UI',
      salario: '$5,500,000 COP',
      descripcion: 'Diseña experiencias intuitivas y visualmente atractivas.',
      requisitos: [
        'Adobe XD, Figma',
        'Prototipado rápido',
        'Investigación de usuario',
        'Trabajo colaborativo'
      ],
      imagen: 'https://weareshifta.com/wp-content/uploads/diseno-ux-1.jpg'
    }
  ];

  vacanteSeleccionada = this.vacantes[0];

  seleccionarVacante(vacante: any): void {
    this.vacanteSeleccionada = vacante;
  }

  eliminarVacante(vacante: any): void {
    console.log('Eliminar vacante:', vacante);
  }

  abrirModalAgregar() {
    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('modalAgregarVacante'),
      {}
    );
    modal.show();
  }

  editarVacante(vacante: any): void {
    this.vacanteSeleccionada = vacante;
    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('modalEditarVacante')
    );
    modal.show();
  }
}
