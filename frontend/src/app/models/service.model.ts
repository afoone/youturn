import { Enterprise } from './enterprise.model';

export type Service = {
  _id: string;
  uuid: string;
  name: string;
  description?: string;
  inputCaption?: string;
  preInfoHtml?: string;
  preInfoPrintText?: string;
  ticketText?: string;
  ticket?: boolean;
  prefix?: string;
  color?: string;
  textColor?: string;
  parentId?: number;
  priority?: number;
  weight?: number;
  pause?: boolean;
  pauseReason?: string;
  hideNumber?: boolean;
  hideNumberReason?: string;
  hideNumberTemp?: boolean;
  hideNumberTempReason?: string;
  hideNumberTempDate?: string;
  hideNumberTempTime?: string;
  tempReasonUnavailable?: string;
  childrenOfService?: string[];
  parentService?: string;
  enterprise?: Enterprise | string; // Enterprise a la que pertenece el servicio
};
