import { Service } from './service.model';
import { Enterprise } from './enterprise.model';

export interface ServiceWithPriority {
  service: Service | string;
  priority: boolean;
}

export interface TicketPoint {
  _id?: string;
  name: string;
  location?: string;
  enterprise: Enterprise | string;
  services: Service[] | string[] | ServiceWithPriority[];
}

