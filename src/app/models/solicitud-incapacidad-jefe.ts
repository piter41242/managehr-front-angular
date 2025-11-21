export interface SolicitudIncapacidadJefe {
  idIncapacidad?: number;
  descrip: string;
  archivo?: string;
  fechaInicio: string;
  fechaFinal: string;
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

export interface RespuestaSolicitudIncapacidad {
  idIncapacidad: number;
  estado: 'aprobado' | 'rechazado';
  comentario?: string;
} 