import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JefePersonalService } from '../../services/jefe-personal.service';
import { MenuComponent } from '../menu/menu.component';

interface EmpleadosResponse {
  empleados: any[];
  area: string;
  message: string;
}

@Component({
  selector: 'app-jefe-personal',
  standalone: true,
  imports: [CommonModule, FormsModule,  MenuComponent],
  templateUrl: './jefe-personal.component.html',
  styleUrls: ['./jefe-personal.component.scss']
})
export class JefePersonalComponent implements OnInit {
  empleados: any[] = [];
  empleadosFiltrados: any[] = [];
  filtroNombre: string = '';
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1;
  areaNombre: string = '';
  hojaDeVidaSeleccionada: any = null;
  mostrarModalHojaVida = false;
  
  // Propiedades para estudios y experiencias
  estudios: any[] = [];
  experiencias: any[] = [];
  mostrarModalEstudios = false;
  mostrarModalExperiencias = false;
  empleadoSeleccionado: any = null;

  constructor(private jefePersonalService: JefePersonalService) {}

  ngOnInit() {
    const userFromLocal = localStorage.getItem('usuario');
    //console.log('userFromLocal:', userFromLocal);
    if (userFromLocal) {
      const usuario = JSON.parse(userFromLocal);
      const jefeId = usuario.id || usuario.idUsuario;
      //console.log('Jefe ID:', jefeId);
      this.jefePersonalService.getEmpleadosPorJefe(jefeId).subscribe(
        (response: EmpleadosResponse) => {
          //console.log('Respuesta del backend:', response);
          this.empleados = response.empleados || [];
          this.areaNombre = response.area || '';
          this.filtrarEmpleados();
          //console.log('Empleados cargados:', this.empleados);
        },
        (error) => {
          console.error('Error al obtener empleados:', error);
        }
      );
    } else {
      console.error('No se encontró el usuario en localStorage');
    }
  }

  filtrarEmpleados(): void {
    if (this.filtroNombre.trim() === '') {
      this.empleadosFiltrados = this.empleados;
    } else {
      const filtro = this.filtroNombre.toLowerCase();
      this.empleadosFiltrados = this.empleados.filter(emp =>
        (emp.name && emp.name.toLowerCase().includes(filtro)) ||
        (emp.perfil?.primerApellido && emp.perfil.primerApellido.toLowerCase().includes(filtro)) ||
        (emp.perfil?.primerNombre && emp.perfil.primerNombre.toLowerCase().includes(filtro))
      );
    }
    this.totalPages = Math.ceil(this.empleadosFiltrados.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  get paginatedEmpleados() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.empleadosFiltrados.slice(start, start + this.itemsPerPage);
  }

  verEmpleado(empleado: any) {
    alert('Ver detalles de: ' + (empleado.name || empleado.perfil?.primerNombre));
  }

  editarEmpleado(empleado: any) {
    alert('Editar empleado: ' + (empleado.name || empleado.perfil?.primerNombre));
  }

  cambiarPagina(pagina: number) {
    this.currentPage = pagina;
  }

  mostrarHojaVida(empleado: any) {
    const numDocumento = empleado.perfil?.numDocumento;
    this.jefePersonalService.getHojaDeVidaPorDocumento(numDocumento).subscribe(
      (data) => {
        this.hojaDeVidaSeleccionada = data.hojaDeVida;
        this.mostrarModalHojaVida = true;
      },
      (error) => {
        alert('No se pudo cargar la hoja de vida');
      }
    );
  }

  // Método para mostrar estudios
  mostrarEstudios(empleado: any) {
    this.empleadoSeleccionado = empleado;
    const numDocumento = empleado.perfil?.numDocumento;
    console.log('Mostrando estudios para empleado:', empleado);
    console.log('Número de documento:', numDocumento);
    
    // Primero obtener la hoja de vida para obtener el ID
    this.jefePersonalService.getHojaDeVidaPorDocumento(numDocumento).subscribe(
      (data) => {
        console.log('Datos de hoja de vida:', data);
        const idHojaDeVida = data.hojaDeVida?.idHojaDeVida;
        console.log('ID Hoja de Vida:', idHojaDeVida);
        if (idHojaDeVida) {
          // Luego obtener los estudios
          this.jefePersonalService.getEstudiosPorHoja(idHojaDeVida).subscribe(
            (estudiosData) => {
              console.log('Datos de estudios:', estudiosData);
              this.estudios = estudiosData.estudios || [];
              this.mostrarModalEstudios = true;
            },
            (error) => {
              console.error('Error al obtener estudios:', error);
              alert('No se pudieron cargar los estudios');
            }
          );
        } else {
          alert('No se encontró la hoja de vida del empleado');
        }
      },
      (error) => {
        console.error('Error al obtener hoja de vida:', error);
        alert('No se pudo cargar la hoja de vida');
      }
    );
  }

  // Método para mostrar experiencias laborales
  mostrarExperiencias(empleado: any) {
    this.empleadoSeleccionado = empleado;
    const numDocumento = empleado.perfil?.numDocumento;
    console.log('Mostrando experiencias para empleado:', empleado);
    console.log('Número de documento:', numDocumento);
    
    // Primero obtener la hoja de vida para obtener el ID
    this.jefePersonalService.getHojaDeVidaPorDocumento(numDocumento).subscribe(
      (data) => {
        console.log('Datos de hoja de vida:', data);
        const idHojaDeVida = data.hojaDeVida?.idHojaDeVida;
        console.log('ID Hoja de Vida:', idHojaDeVida);
        if (idHojaDeVida) {
          // Luego obtener las experiencias
          this.jefePersonalService.getExperienciaPorHoja(idHojaDeVida).subscribe(
            (experienciasData) => {
              console.log('Datos de experiencias:', experienciasData);
              this.experiencias = experienciasData.data || [];
              this.mostrarModalExperiencias = true;
            },
            (error) => {
              console.error('Error al obtener experiencias:', error);
              alert('No se pudieron cargar las experiencias laborales');
            }
          );
        } else {
          alert('No se encontró la hoja de vida del empleado');
        }
      },
      (error) => {
        console.error('Error al obtener hoja de vida:', error);
        alert('No se pudo cargar la hoja de vida');
      }
    );
  }

  // Métodos para cerrar modales
  cerrarModalEstudios() {
    this.mostrarModalEstudios = false;
    this.estudios = [];
    this.empleadoSeleccionado = null;
  }

  cerrarModalExperiencias() {
    this.mostrarModalExperiencias = false;
    this.experiencias = [];
    this.empleadoSeleccionado = null;
  }
}