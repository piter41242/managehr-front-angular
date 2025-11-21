import { Component, OnInit } from '@angular/core';
import { MenuComponent } from "../menu/menu.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { UsuariosService } from '../../services/usuarios.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MenuComponent, FormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isModalVisible: boolean = false;

  user: User = {
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    usuario: '',
    tipoDocumento: '',
    numeroDocumento: '',
    fechaNacimiento: '',
    numeroHijos: null,
    contactoEmergencia: '',
    numeroContactoEmergencia: '',
    email: '',
    direccion: '',
    telefono: '',
    nacionalidad: '',
    eps: '',
    genero: '',
    estadoCivil: '',
    pensiones: ''
  };


  tipoDocumentoLista = [
    { id: "Cedula de Ciudadania", nombre: 'Cedula de Ciudadania' },
    { id: "Cedula de Extranjeria", nombre: 'Cedula de Extranjeria' },
    { id: "Pasaporte", nombre: 'Pasaporte' }
  ];

  generoLista = [
    { id: "Masculino", nombre: 'Masculino' },
    { id: "Femenino", nombre: 'Femenino' },
    { id: "Otro", nombre: 'Otro' }
  ];


  estadoCivilLista = [
    { id: 1, nombre: 'Soltero' },
    { id: 2, nombre: 'Casado' },
    { id: 3, nombre: 'Divorciado' },
    { id: 4, nombre: 'Viudo' },
    { id: 5, nombre: 'Separado' },
    { id: 6, nombre: 'Union Libre' }
  ];

  epsLista = [
    { codigo: 'CCFC24', nombre: 'COMFAMILIAR HUILA' }, { codigo: 'EPS001', nombre: 'ALIANSALUD' },
    { codigo: 'EPS002', nombre: 'SALUDCOOP' }, { codigo: 'EPS003', nombre: 'CAFESALUD' },
    { codigo: 'EPS005', nombre: 'SAVIA SALUD' }, { codigo: 'EPS008', nombre: 'COMPENSAR' },
    { codigo: 'EPS009', nombre: 'COMFENALCO ANTIOQUIA' }, { codigo: 'EPS012', nombre: 'COMFENALCO VALLE' },
    { codigo: 'EPS013', nombre: 'SALUDVIDA' }, { codigo: 'EPS014', nombre: 'HUMANA VIVIR' },
    { codigo: 'EPS015', nombre: 'COLPATRIA' }, { codigo: 'EPS016', nombre: 'COOMEVA' },
    { codigo: 'EPS017', nombre: 'FAMISANAR' }, { codigo: 'EPS023', nombre: 'CRUZ BLANCA' },
    { codigo: 'EPS033', nombre: 'SANITAS' }, { codigo: 'EPS034', nombre: 'SALUD COLOMBIA' },
    { codigo: 'EPS037', nombre: 'LA NUEVA EPS' }, { codigo: 'EPS039', nombre: 'GOLDEN CROSS' },
    { codigo: 'EPS040', nombre: 'SOS' }, { codigo: 'EPS044', nombre: 'MEDIMAS' },
    { codigo: 'EPS046', nombre: 'SALUD TOTAL' }, { codigo: 'EPS047', nombre: 'SALUD MIA' },
    { codigo: 'EPSC22', nombre: 'CONVIDA' }, { codigo: 'EPSC34', nombre: 'CAPITAL SALUD' },
    { codigo: 'EPSIC3', nombre: 'AIC' }
  ];

  pensionesLista = [
    { codigo: '230201', nombre: 'PROTECCION' }, { codigo: '230301', nombre: 'PORVENIR' },
    { codigo: '230901', nombre: 'OLD MUTUAL' }, { codigo: '230904', nombre: 'OLD MUTUAL ALTERNATIVO' },
    { codigo: '231001', nombre: 'COLFONDOS' }, { codigo: '25-14', nombre: 'COLPENSIONES' },
    { codigo: '25-2', nombre: 'CAXDAC' }, { codigo: '25-3', nombre: 'FONPRECON' }
  ];

  nacionalidadesLista = [
    { id: 160, nombre: 'COLOMBIA' }, { id: 161, nombre: 'ARGENTINA' }, { id: 162, nombre: 'CHILE' },
    { id: 163, nombre: 'ECUADOR' }, { id: 169, nombre: 'VENEZUELA' }, { id: 301, nombre: 'CANADA' },
    { id: 302, nombre: 'ESTADOS UNIDOS DE AMERICA' }, { id: 399, nombre: 'OTROS PAISES O TERRITORIOS DE SUDAMERICA' },
    { id: 433, nombre: 'SIRIA' }, { id: 434, nombre: 'SRI LANKA' }, { id: 435, nombre: 'TAILANDIA' },
    { id: 437, nombre: 'VIETNAM' }, { id: 439, nombre: 'BRUNEI' }, { id: 440, nombre: 'ISLAS MARSHALL' },
    { id: 441, nombre: 'YEMEN' }, { id: 442, nombre: 'AZERBAIYAN' }, { id: 443, nombre: 'KAZAJSTAN' },
    { id: 444, nombre: 'KIRGUISTAN' }, { id: 445, nombre: 'TADYIKISTAN' }, { id: 446, nombre: 'TURKMENISTAN' },
    { id: 447, nombre: 'UZBEKISTAN' }, { id: 448, nombre: 'ISLAS MARIANAS DEL NORTE' }, { id: 449, nombre: 'PALESTINA' },
    { id: 450, nombre: 'HONG KONG' }, { id: 453, nombre: 'BUTÁN' }, { id: 454, nombre: 'GUAM' },
    { id: 455, nombre: 'MACAO' }, { id: 499, nombre: 'OTROS PAISES O TERRITORIOS DE ASIA' },
    { id: 501, nombre: 'AUSTRALIA' }, { id: 502, nombre: 'FIJI' }, { id: 504, nombre: 'NUEVA ZELANDA' },
    { id: 505, nombre: 'PAPUA NUEVA GUINEA' }, { id: 506, nombre: 'ISLAS SALOMON' }, { id: 507, nombre: 'SAMOA' },
    { id: 508, nombre: 'TONGA' }, { id: 509, nombre: 'VANUATU' }, { id: 511, nombre: 'MICRONESIA' },
    { id: 512, nombre: 'TUVALU' }, { id: 513, nombre: 'ISLAS COOK' }, { id: 515, nombre: 'NAURU' },
    { id: 516, nombre: 'PALAOS' }, { id: 517, nombre: 'TIMOR ORIENTAL' }, { id: 520, nombre: 'POLINESIA FRANCESA' },
    { id: 521, nombre: 'ISLA NORFOLK' }, { id: 522, nombre: 'KIRIBATI' }, { id: 523, nombre: 'NIUE' },
    { id: 524, nombre: 'ISLAS PITCAIRN' }, { id: 525, nombre: 'TOKELAU' }, { id: 526, nombre: 'NUEVA CALEDONIA' },
    { id: 527, nombre: 'WALLIS Y FORTUNA' }, { id: 528, nombre: 'SAMOA AMERICANA' }, { id: 599, nombre: 'OTROS PAISES O TERRITORIOS DE OCEANIA' }
  ];

  constructor(private userService: UserService,private usuariosService:UsuariosService) {}

  ngOnInit(): void {
    this.loadUserData();
  }
  
  loadUserData(): void {
    this.userService.getUserProfile().subscribe((userData: any) => {
      this.user = {
        primerNombre: userData.primerNombre,
        segundoNombre: userData.segundoNombre,
        primerApellido: userData.primerApellido,
        segundoApellido: userData.segundoApellido,
        usuario: '',
        tipoDocumento: userData.tipo_documento?.nombreTipoDocumento || '',
        numeroDocumento: userData.numDocumento,
        fechaNacimiento: userData.fechaNac,
        numeroHijos: userData.numHijos,
        contactoEmergencia: userData.contactoEmergencia,
        numeroContactoEmergencia: userData.numContactoEmergencia,
        email: userData.email,
        direccion: userData.direccion,
        telefono: userData.telefono,
        nacionalidad: userData.nacionalidadId,
        eps: userData.epsCodigo,
        genero: userData.genero?.nombreGenero || '',
        estadoCivil: userData.estadoCivilId,
        pensiones: userData.pensionesCodigo
      };
    }, error => {
      console.error('Error al obtener el perfil del usuario', error);
    });
  }

  openModal(): void {
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
  }

  updateInfo(): void {
    const payload = {
      email: this.user.email,
      direccion: this.user.direccion,
      telefono: this.user.telefono,
      numHijos: this.user.numeroHijos,
      contactoEmergencia: this.user.contactoEmergencia,
      numContactoEmergencia: this.user.numeroContactoEmergencia,
      estadoCivilId: this.user.estadoCivil
    };

    console.log('Payload enviado:', payload);

    this.userService.updateUserProfile(payload).subscribe(response => {
      console.log('Perfil actualizado:', response);
      this.closeModal();
    }, error => {
      console.error('Error al actualizar el perfil', error);
    });
  }
}
