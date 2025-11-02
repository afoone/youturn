import { Service } from "./service.model";

export interface Operator  {
  _id?: string
  positionName: string
  description?: string
  services: Service[]
  pathDescription?: string // Description of the path to the operator (e.g., "2nd floor, room 201")
  customer?: any
}

