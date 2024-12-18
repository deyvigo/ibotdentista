import { RowDataPacket } from 'mysql2'

export interface ServiceDTO extends RowDataPacket{
  id_service: string,
  name: string,
  cost: string
}

export interface CreateServiceDTO {
  name: string,
  description: string,
  id_doctor: string
}