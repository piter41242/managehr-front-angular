export interface User {
  primerNombre: string;
  segundoNombre: string | null;
  primerApellido: string;
  segundoApellido: string | null;
  usuario: string;

  tipoDocumento: number | string;
  numeroDocumento: string;
  fechaNacimiento: string;

  numeroHijos: number | null;
  contactoEmergencia: string;
  numeroContactoEmergencia: string;

  email: string;
  direccion: string;
  telefono: string;

  nacionalidad: number | string;
  eps: string;
  genero: number | string;
  estadoCivil: number | string;
  pensiones: string;
}
