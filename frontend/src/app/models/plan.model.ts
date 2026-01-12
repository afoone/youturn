export interface Plan {
  _id?: string;
  codigo: string;
  descripcion: string;
  precio: number;
  detalles?: string;
  maxTicketPoints: number;
  maxUsuarios: number;
  maxServicios: number;
}

