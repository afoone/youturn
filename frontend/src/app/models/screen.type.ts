import { Service } from './service.model';

export interface Screen {
  _id?: string;
  name: string;
  location?: string;
  resolutionWidth?: number;
  resolutionHeight?: number;
  services: Service[];
}
