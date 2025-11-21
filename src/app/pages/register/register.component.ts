import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { VacantesService } from 'src/app/services/vacantes.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  nombre = '';
  email = '';
  confirmarEmail = '';
  password = '';
  confirmarPassword = '';
  mensaje = '';
  registroExitoso = false;
  numDocumento = '';

  primerNombre = '';
  segundoNombre = '';
  primerApellido = '';
  segundoApellido = '';

  vacantes: any[] = [];
  vacanteSeleccionada: any = null;

  constructor(
    private authService: AuthService,
    private usuariosService: UsuariosService,
    private router: Router,
    private vacantesService: VacantesService
  ) {}

  ngOnInit(): void {
    document.body.classList.remove('login-background');
    this.eliminarModalBackdrop();
    this.cargarVacantes(); // 👈 Asegúrate de llamarlo
  }

  ngOnDestroy(): void {
    document.body.classList.remove('login-background');
    this.eliminarModalBackdrop();
  }

  seleccionarVacante(vacante: any): void {
    this.vacanteSeleccionada = vacante;
    this.mensaje = '';
    this.registroExitoso = false;
  }

  enviarFormulario(): void {
    if (this.email !== this.confirmarEmail) {
      this.mensaje = 'Los correos electrónicos no coinciden.';
      return;
    }

    if (this.password !== this.confirmarPassword) {
      this.mensaje = 'Las contraseñas no coinciden.';
      return;
    }

    if (!this.numDocumento) {
      this.mensaje = 'Debe ingresar su número de documento.';
      return;
    }

    const partes = this.procesarNombreCompleto(this.nombre);
    if (!partes) return;

    const data = {
      name: this.nombre,
      email: this.email,
      email_confirmation: this.confirmarEmail,
      password: this.password,
      password_confirmation: this.confirmarPassword,
      rol: 5
    };

    this.authService.register(data).subscribe({
      next: (res) => {
        this.mensaje = 'Registro exitoso';
        this.registroExitoso = true;

        if (res.user) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('usuario', JSON.stringify(res.user));
          this.crearUsuario(res.user.id);
        }

        this.router.navigate(['/vacantes']).then(() => {
          this.eliminarModalBackdrop();
        });

        this.resetForm();
      },
      error: (err) => {
        console.error(err);
        if (err.status === 422 && err.error?.errors) {
          const errores = Object.values(err.error.errors).flat().join(' ');
          this.mensaje = errores;
        } else {
          this.mensaje = err.error?.message || 'Error en el registro.';
        }
        this.registroExitoso = false;
      }
    });
  }

  crearUsuario(userId: number): void {
    const partes = this.procesarNombreCompleto(this.nombre);
    if (!partes) return;

    const usuarioData = {
      numDocumento: this.numDocumento,
      primerNombre: this.primerNombre,
      segundoNombre: this.segundoNombre,
      primerApellido: this.primerApellido,
      segundoApellido: this.segundoApellido,
      password: this.password,
      fechaNac: '1990-01-01',
      numHijos: 0,
      contactoEmergencia: 'No aplica',
      numContactoEmergencia: '0000000000',
      email: this.email,
      direccion: 'No especificada',
      telefono: '0000000000',
      nacionalidadId: 160,
      epsCodigo: 'EPS001',
      generoId: 1,
      tipoDocumentoId: 1,
      estadoCivilId: 1,
      pensionesCodigo: '230201',
      usersId: userId
    };

    this.authService.crearUsuario(usuarioData).subscribe({
      next: (res) => {
        console.log('Usuario creado correctamente:', res);
      },
      error: (err) => {
        console.error('Error al crear usuario:', err);
      }
    });
  }

  cargarVacantes(): void {
    this.vacantesService.getVacantes().subscribe({
      next: (data) => {
        this.vacantes = data.map(v => ({
          titulo: v.nomVacante,
          descripcion: v.descripVacante,
          salario: `$${v.salario.toLocaleString('es-CO')}`,
          requisitos: [v.expMinima, v.cargoVacante],
          imagen: 'https://cdn-icons-png.flaticon.com/512/2721/2721297.png'
        }));

        this.vacanteSeleccionada = this.vacantes.length > 0 ? this.vacantes[0] : null;
      },
      error: (error) => {
        console.error('Error al cargar las vacantes:', error);
      }
    });
  }

  procesarNombreCompleto(nombreCompleto: string): boolean {
    const partes = nombreCompleto.trim().split(/\s+/);

    this.primerNombre = '';
    this.segundoNombre = '';
    this.primerApellido = '';
    this.segundoApellido = '';

    if (partes.length < 2 || partes.length > 4) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe ingresar entre 1-2 nombres y 1-2 apellidos.',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        this.resetForm();
        this.eliminarModalBackdrop();
      });
      return false;
    }

    // Asignación inteligente
    [this.primerNombre, this.segundoNombre, this.primerApellido, this.segundoApellido] = [
      partes[0] || '',
      partes[1] && partes.length >= 3 ? partes[1] : '',
      partes.length === 2 ? partes[1] : partes[2] || '',
      partes.length === 4 ? partes[3] : ''
    ];

    return true;
  }

  private eliminarModalBackdrop(): void {
    document.querySelectorAll('.modal-backdrop')?.forEach(b => b.remove());
    document.querySelectorAll('.modal.show')?.forEach(m => m.classList.remove('show'));
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  private resetForm(): void {
    this.nombre = '';
    this.email = '';
    this.confirmarEmail = '';
    this.password = '';
    this.confirmarPassword = '';
  }

  volver(): void {
    window.history.back();
  }

  soloLetras(event: KeyboardEvent): boolean {
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  soloNumeros(event: KeyboardEvent): boolean {
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }
}
