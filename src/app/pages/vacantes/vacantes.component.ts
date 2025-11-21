import { CommonModule } from '@angular/common';
import { MenuComponent } from '../menu/menu.component';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { VacantesService, Vacante } from '../../services/vacantes.service';
import { PostulacionesService } from '../../services/postulaciones.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-vacantes',
  standalone: true,
  imports: [CommonModule, MenuComponent, FormsModule],
  templateUrl: './vacantes.component.html',
  styleUrls: ['./vacantes.component.scss']
})
export class VacantesComponent implements OnInit, AfterViewInit {
  vacantes: Vacante[] = [];
  vacanteSeleccionada: Vacante | any = {};
  errorCargandoVacantes: boolean = false;

  @ViewChild('confirmacionModal') confirmacionModalElement!: ElementRef;
  private confirmacionModal: any;

  constructor(
    private vacantesService: VacantesService,
    private postulacionesService: PostulacionesService
  ) {}

  ngOnInit(): void {
    this.cargarVacantes();
  }

  ngAfterViewInit(): void {
    if (this.confirmacionModalElement) {
      this.confirmacionModal = new bootstrap.Modal(this.confirmacionModalElement.nativeElement);
    }
  }

  cargarVacantes(): void {
    this.vacantesService.getVacantes()
      .pipe(
        catchError(error => {
          console.error('Error al cargar las vacantes:', error);
          this.errorCargandoVacantes = true;
          return of([]);
        })
      )
      .subscribe((data: Vacante[]) => {
        this.vacantes = data;
        this.vacanteSeleccionada = this.vacantes.length > 0 ? this.vacantes[0] : {};
        this.errorCargandoVacantes = false;
      });
  }

  seleccionarVacante(vacante: Vacante): void {
    this.vacanteSeleccionada = vacante;
  }

  postularme(): void {
    if (this.vacanteSeleccionada && this.vacanteSeleccionada.idVacantes) {
      this.confirmacionModal?.show();
    } else {
      alert("Por favor, selecciona una vacante antes de postularte.");
    }
  }

  confirmarPostulacion(): void {
    if (this.confirmacionModal) {
      this.confirmacionModal.hide();
    }

    const postulacionData = {
      vacantesId: this.vacanteSeleccionada.idVacantes
    };

    this.postulacionesService.crearPostulacion(postulacionData).subscribe({
      next: (response) => {
        alert('✅ ¡Te has postulado con éxito a la vacante: ' + this.vacanteSeleccionada.nomVacante + '!');
      },
      error: (error) => {
        if (error.status === 409 && error.error?.message) {
          alert('⚠️ ' + error.error.message);
        } else if (error.status === 401) {
          alert('❌ No tienes permisos para postularte. Inicia sesión correctamente.');
        } else if (error.status === 422 && error.error?.errors) {
          let validationErrors = 'Errores de validación:\n';
          for (const key in error.error.errors) {
            validationErrors += `- ${error.error.errors[key].join(', ')}\n`;
          }
          alert('❌ Error al enviar la postulación:\n' + validationErrors);
        } else {
          alert('❌ Ocurrió un error al postularte. Por favor, inténtalo de nuevo.');
        }
      }
    });
  }

  cancelarPostulacion(): void {
    this.confirmacionModal?.hide();
  }
}
