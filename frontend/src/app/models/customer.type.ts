import { Operator } from './operator.type';

export type Customer = {
  _id?: string;
  queuedTime: number;
  inputData?: string;
  serviceId: string;
  service: string;
  status:
    | 'QUEUED'
    | 'IN_SERVICE'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'POSTPONED'
    | 'RECALLED'
    | 'CALLING';
  complexId?: number[][][];
  language?: 'en' | 'es' | 'fr' | 'de';
  ticketNumber?: string;
  operator?: Operator;
};
