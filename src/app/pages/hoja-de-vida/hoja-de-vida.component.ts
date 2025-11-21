import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuComponent } from '../menu/menu.component';
import { HojaDeVidaService } from 'src/app/services/hoja-de-vida.service';
import { EstudiosService } from 'src/app/services/estudios.service';
import { ExperienciaService } from 'src/app/services/experiencia.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-hoja-de-vida',
  standalone: true,
  templateUrl: './hoja-de-vida.component.html',
  styleUrls: ['./hoja-de-vida.component.scss'],
  imports: [CommonModule, FormsModule, MenuComponent]
})
export class HojaDeVidaComponent implements OnInit {
  hojaDeVida: any = {};
  estudios: any[] = [];
  experiencias: any[] = [];

  mostrarModalEditarLibreta = false;
  mostrarModalAgregarEstudio = false;
  mostrarModalAgregarExperiencia = false;

  nuevoEstudio: any = {};
  nuevaExperiencia: any = {};
  archivoEstudio: File | null = null;
  archivoExperiencia: File | null = null;

  usuario: any;
  idHojaDeVida: number | null = null;

  editandoEstudio: boolean = false;
  idRelacionEstudio: number | null = null; 

  constructor(
    private hojaDeVidaService: HojaDeVidaService,
    private estudiosService: EstudiosService,
    private experienciaService: ExperienciaService
  ) {}

  ngOnInit(): void {
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      this.usuario = JSON.parse(usuarioString);
      this.cargarHojaDeVida();
    } else {
      Swal.fire('Usuario no encontrado', 'Debes iniciar sesión nuevamente', 'warning');
    }
  }

  cargarHojaDeVida() {
    this.hojaDeVidaService.getHojaDeVidaPorDocumento(this.usuario?.perfil?.numDocumento).subscribe({
      next: (res) => {
        this.hojaDeVida = res.hojaDeVida;
        this.idHojaDeVida = res.hojaDeVida?.idHojaDeVida;
        this.cargarEstudios();
        this.cargarExperiencias();
      },
      error: (err) => {
        console.error('❌ Error al cargar la hoja de vida', err);
        Swal.fire('Error', 'No se pudo cargar la hoja de vida', 'error');
      }
    });
  }

  cargarEstudios() {
    if (!this.idHojaDeVida) return;
    this.estudiosService.getPorHojaDeVida(this.idHojaDeVida).subscribe({
      next: (res) => {
        console.log('🔍 ESTUDIOS recibidos desde el backend:', res);
        this.estudios = res.estudios.map((e: any) => {
          const datos = e.estudio || e;
          return {
            ...datos,
            abierto: false,
            idRelacion: e.idHasestudios
          };
        });
        console.log('📦 this.estudios procesado:', this.estudios);
      },
      error: (err) => {
        console.error('❌ Error al cargar estudios', err);
        Swal.fire('Error', 'No se pudieron cargar los estudios', 'error');
      }
    });
  }

  cargarExperiencias() {
    if (!this.idHojaDeVida) return;

    this.experienciaService.getPorHojaDeVida(this.idHojaDeVida).subscribe({
      next: (res) => {
        const lista = res.data ?? [];

        this.experiencias = lista.map((relacion: any) => {
          const datos = relacion.experiencia || {};
          return {
            ...datos,
            abierto: false,
            idRelacion: relacion.idHasexperiencia ?? relacion.id,
            archivo: relacion.archivo
    
          };
        });

        console.log('📦 Experiencias procesadas:', this.experiencias);
      },
      error: (err) => {
        console.error('❌ Error al cargar experiencias', err);
        Swal.fire('Error', 'No se pudieron cargar las experiencias', 'error');
      }
    });
  }

  abrirModalEditarLibreta() {
    this.mostrarModalEditarLibreta = true;
  }

  cerrarModalEditarLibreta() {
    this.mostrarModalEditarLibreta = false;
  }

  guardarCambiosLibreta() {
    if (!this.hojaDeVida.idHojaDeVida) return;
    const payload = {
      claseLibretaMilitar: this.hojaDeVida.claseLibretaMilitar,
      numeroLibretaMilitar: this.hojaDeVida.numeroLibretaMilitar,
      usuarioNumDocumento: this.hojaDeVida.usuarioNumDocumento
    };
    this.hojaDeVidaService.actualizarHojaDeVida(this.hojaDeVida.idHojaDeVida, payload).subscribe({
      next: () => {
        this.cerrarModalEditarLibreta();
        Swal.fire('Actualizado', 'La libreta militar fue actualizada correctamente', 'success');
        this.cargarHojaDeVida();
      },
      error: (err) => {
        console.error('❌ Error al actualizar libreta militar', err);
        Swal.fire('Error', 'No se pudo actualizar la libreta militar', 'error');
      }
    });
  }

  abrirModalAgregarEstudio() {
    this.nuevoEstudio = {};
    this.mostrarModalAgregarEstudio = true;
  }

  cerrarModalAgregarEstudio() {
    this.mostrarModalAgregarEstudio = false;
  }
  crearRelacionEstudio(idEstudios: number): void {
    const formData = new FormData();
    formData.append('numDocumento', this.usuario.perfil.numDocumento);
    formData.append('idEstudios', idEstudios.toString());
    formData.append('estado', '1');

    if (this.archivoEstudio) {
      formData.append('archivo', this.archivoEstudio);
    }
    console.log(formData);
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }
    this.estudiosService.agregarEstudio(formData).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Estudio agregado correctamente', 'success');
        this.cerrarModalAgregarEstudio();
        this.cargarEstudios();
      },
      error: (err) => {
        console.error('❌ Error al crear relación del estudio', err);
        Swal.fire('Error', 'No se pudo guardar la relación del estudio', 'error');
      }
    });
  }
  

  guardarNuevoEstudio(): void {
    if (!this.usuario?.perfil?.numDocumento || !this.idHojaDeVida) return;

    const payloadEstudio = {
      nomEstudio: this.nuevoEstudio.nomEstudio.trim(),
      nomInstitucion: this.nuevoEstudio.nomInstitucion.trim(),
      tituloObtenido: this.nuevoEstudio.tituloObtenido.trim(),
      anioInicio: this.nuevoEstudio.anioInicio,
      anioFinalizacion: this.nuevoEstudio.anioFinalizacion
    };

    // Paso 1: Validar si el estudio ya existe
    this.estudiosService.buscarEstudioPorNombre(payloadEstudio).subscribe({
      next: (res) => {
        const idEstudios = res?.estudio?.idEstudios;

        if (idEstudios) {
          if (this.editandoEstudio && this.idRelacionEstudio) {
            this.actualizarRelacionEstudio(this.idRelacionEstudio, idEstudios);
          } else {
            this.crearRelacionEstudio(idEstudios);
          }
        } else {
          // Si no existe, crearlo primero
          this.estudiosService.create(payloadEstudio).subscribe({
            next: (resCreate) => {
              const nuevoId = resCreate?.estudio?.idEstudios;
              if (!nuevoId) {
                Swal.fire('Error', 'No se recibió el ID del estudio creado', 'error');
                return;
              }
              if (this.editandoEstudio && this.idRelacionEstudio) {
                this.actualizarRelacionEstudio(this.idRelacionEstudio, nuevoId);
              } else {
                this.crearRelacionEstudio(nuevoId);
              }
            },
            error: (err) => {
              console.error('❌ Error al crear estudio', err);
              Swal.fire('Error', 'No se pudo crear el estudio', 'error');
            }
          });
        }
      },
      error: (err) => {
        console.error('❌ Error al validar existencia del estudio', err);
        Swal.fire('Error', 'No se pudo verificar si el estudio ya existe', 'error');
      }
    });
  }

  actualizarRelacionEstudio(idRelacion: number, idEstudios: number): void {
    const formData = new FormData();
    formData.append('idHojaDeVida', this.idHojaDeVida!.toString());
    formData.append('idEstudios', idEstudios.toString());
    formData.append('estado', '1');
    if (this.archivoEstudio) {
      formData.append('archivo', this.archivoEstudio);
    }

    this.estudiosService.actualizarRelacionEstudio(idRelacion, formData).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Estudio actualizado correctamente', 'success');
        this.cerrarModalAgregarEstudio();
        this.cargarEstudios();
        this.resetFormularioEstudio();
      },
      error: (err) => {
        console.error('❌ Error al actualizar estudio', err);
        Swal.fire('Error', 'No se pudo actualizar el estudio', 'error');
      }
    });
  }

  resetFormularioEstudio(): void {
    this.nuevoEstudio = {} as any;
    this.archivoEstudio = null;
    this.idRelacionEstudio = null;
    this.editandoEstudio = false;
  }

  eliminarEstudio(index: number) {
  Swal.fire({
    title: '¿Estás segura?',
    text: 'Esta acción eliminará el estudio permanentemente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      const idRelacion = this.estudios[index].idRelacion;

      this.estudiosService.delete(idRelacion).subscribe({
        next: () => {
          Swal.fire('Eliminado', 'El estudio ha sido eliminado', 'success');
          this.cargarEstudios();
        },
        error: (err) => {
          console.error('❌ Error al eliminar estudio', err);
          Swal.fire('Error', 'No se pudo eliminar el estudio', 'error');
        }
      });
    }
  });
}

  toggleEstudio(index: number) {
    this.estudios[index].abierto = !this.estudios[index].abierto;
  }

  editarEstudio(index: number): void {
    const estudioSeleccionado = this.estudios[index];
    this.nuevoEstudio = {
      nomEstudio: estudioSeleccionado.nomEstudio,
      nomInstitucion: estudioSeleccionado.nomInstitucion,
      tituloObtenido: estudioSeleccionado.tituloObtenido,
      anioInicio: estudioSeleccionado.anioInicio,
      anioFinalizacion: estudioSeleccionado.anioFinalizacion
    };
    this.idRelacionEstudio = estudioSeleccionado.idRelacion;
    this.editandoEstudio = true;
    this.mostrarModalAgregarEstudio = true;
  }







  abrirModalAgregarExperiencia() {
    this.nuevaExperiencia = {};
    this.archivoExperiencia = null;
    this.mostrarModalAgregarExperiencia = true;
  }

  cerrarModalAgregarExperiencia() {
    this.mostrarModalAgregarExperiencia = false;
  }
  onArchivoSeleccionadoEstudio(event: Event): void{
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoEstudio = input.files[0];
    }
  }
  onArchivoSeleccionado(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.archivoExperiencia = file;
    }
  }

  guardarNuevaExperiencia() {
    if (!this.idHojaDeVida || !this.archivoExperiencia) {
      Swal.fire('Advertencia', 'Debes seleccionar un archivo para la experiencia', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('nomEmpresa', this.nuevaExperiencia.nomEmpresa);
    formData.append('nomJefe', this.nuevaExperiencia.nomJefe);
    formData.append('telefono', this.nuevaExperiencia.telefono);
    formData.append('cargo', this.nuevaExperiencia.cargo);
    formData.append('actividades', this.nuevaExperiencia.actividades);
    formData.append('fechaInicio', this.nuevaExperiencia.fechaInicio);
    formData.append('fechaFinalizacion', this.nuevaExperiencia.fechaFinalizacion);
    formData.append('archivo', this.archivoExperiencia);
    formData.append('idHojaDevida', this.idHojaDeVida.toString());

    this.experienciaService.createConArchivo(formData).subscribe({
      next: () => {
        this.cerrarModalAgregarExperiencia();
        Swal.fire('Éxito', 'Experiencia registrada correctamente', 'success');
        this.cargarExperiencias();
      },
      error: (err) => {
        console.error('❌ Error al guardar experiencia', err);
        Swal.fire('Error', 'No se pudo guardar la experiencia', 'error');
      }
    });
  }

  eliminarExperiencia(index: number) {
  Swal.fire({
    title: '¿Estás segura?',
    text: 'Esta acción eliminará la experiencia laboral permanentemente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      const idRelacion = this.experiencias[index].idRelacion;

      this.experienciaService.delete(idRelacion).subscribe({
        next: () => {
          Swal.fire('Eliminado', 'La experiencia ha sido eliminada', 'success');
          this.cargarExperiencias();
        },
        error: (err) => {
          console.error('❌ Error al eliminar experiencia', err);
          Swal.fire('Error', 'No se pudo eliminar la experiencia', 'error');
        }
      });
    }
  });
}

  toggleExperiencia(index: number) {
    this.experiencias[index].abierto = !this.experiencias[index].abierto;
  }

  editarExperiencia(index: number) {
    this.nuevaExperiencia = { ...this.experiencias[index] };
    this.mostrarModalAgregarExperiencia = true;
  }

  soloLetras(event: KeyboardEvent) {
  const pattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
  const inputChar = String.fromCharCode(event.keyCode || event.which);
  if (!pattern.test(inputChar)) {
    event.preventDefault();
  }
}

soloNumeros(event: KeyboardEvent) {
  const pattern = /^[0-9]*$/;
  const inputChar = String.fromCharCode(event.keyCode || event.which);
  if (!pattern.test(inputChar)) {
    event.preventDefault();
  }
}

}
