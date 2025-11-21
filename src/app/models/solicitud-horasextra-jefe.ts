export interface SolicitudHorasExtraJefe {
  idHorasExtra?: number;
  descripcion: string;
  fecha: string;
  tipoHorasId: number;
  nHorasExtra: number;
  contratoId: number;
  estado?: 'pendiente' | 'aprobado' | 'rechazado';
  empleado?: {
    numDocumento: number;
    nombre: string;
    apellido: string;
  };
  contrato?: {
    id: number;
    tipoContrato: string;
    fechaInicio: string;
    fechaFin?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface RespuestaSolicitudHorasExtra {
  idHorasExtra: number;
  estado: 'aprobado' | 'rechazado';
  comentario?: string;
} 