import { Component } from '@angular/core';
import { MenuComponent } from "../menu/menu.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { AuthService } from '../../services/auth.service';



export interface Vacante {
  nombre: string;
  cargo: string;
  telefono: string;
  correo: string;
  direccion: string;
  estado: string;
  foto: string;
}

@Component({
  selector: 'app-directorio',
  standalone: true,
  imports: [MenuComponent, FormsModule, CommonModule],
  templateUrl: './directorio.component.html',
  styleUrls: ['./directorio.component.scss']
})
export class DirectorioComponent {
  
 
  usuario: any = {};

  constructor(public authService: AuthService) {
    const raw = localStorage.getItem('usuario');
    if (raw) {
      this.usuario = JSON.parse(raw);
    }
    
  }
  
  vacantes: Vacante[] = [
    { nombre: 'Emma Wilson', cargo: 'Data Analyst', telefono: '321 123 4567', correo: 'emma@company.com', direccion: 'Calle 100 #15-30, Bogotá', estado: 'ACTIVO', foto: 'https://randomuser.me/api/portraits/women/68.jpg' },
    { nombre: 'Noah Smith', cargo: 'UI/UX Designer', telefono: '322 234 5678', correo: 'noah@company.com', direccion: 'Carrera 7 #45-21, Bogotá', estado: 'ACTIVO', foto: 'https://randomuser.me/api/portraits/men/22.jpg' },
    // Puedes agregar más vacantes aquí
  ];


  vacante: Vacante = this.getNuevaVacante();
  editando: boolean = false;
  vacanteIndex: number = -1;

  // 🆕 Para controlar qué vacante está expandida
  expandedVacanteIndex: number | null = null;

  toggleVacante(index: number): void {
    this.expandedVacanteIndex = this.expandedVacanteIndex === index ? null : index;
  }

  getNuevaVacante(): Vacante {
    return {
      nombre: '', cargo: '', telefono: '', correo: '',
      direccion: '', estado: 'ACTIVO', foto: ''
    };
  }

  abrirModalAgregar() {
    this.vacante = this.getNuevaVacante();
    this.editando = false;
  }

  editarVacante(vacante: Vacante, index: number) {
    this.vacante = { ...vacante };
    this.vacanteIndex = index;
    this.editando = true;
  }

  guardarCambios() {
    if (this.editando) {
      this.vacantes[this.vacanteIndex] = { ...this.vacante };
    } else {
      this.vacantes.push({ ...this.vacante });
    }

    const modal = document.getElementById(this.editando ? 'editarVacanteModal' : 'agregarVacanteModal');
    if (modal) (modal as any).click(); // Forzar cierre con Bootstrap

    this.vacante = this.getNuevaVacante();
    this.editando = false;
  }

  confirmDelete(index: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡Esta acción no se puede deshacer!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.vacantes.splice(index, 1);
        Swal.fire('¡Eliminado!', 'La vacante ha sido eliminada.', 'success');
      }
    });
  }
}
