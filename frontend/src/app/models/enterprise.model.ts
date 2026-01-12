import { Plan } from './plan.model';

export interface Enterprise {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  plan?: Plan | string;
}

