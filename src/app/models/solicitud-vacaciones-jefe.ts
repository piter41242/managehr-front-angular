export interface SolicitudVacacionesJefe {
  idVacaciones?: number;
  motivo: string;
  fechaInicio: string;
  fechaFinal: string;
  dias: number;
  contratoId: number;
  estado?: 'pendiente' | 'aprobado' | 'rechazado';
  // Información básica del empleado
  empleado?: {
    numDocumento: number;
    nombre: string; // primerNombre + segundoNombre
    apellido: string; // primerApellido + segundoApellido
  };
  // Información del contrato
  contrato?: {
    id: number;
    tipoContrato: string;
    fechaInicio: string;
    fechaFin?: string;
  };
  // Fechas de creación y actualización
  createdAt?: string;
  updatedAt?: string;
}

export interface RespuestaSolicitud {
  idVacaciones: number;
  estado: 'aprobado' | 'rechazado';
  comentario?: string;
} 