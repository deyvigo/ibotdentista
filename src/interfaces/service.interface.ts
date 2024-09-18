import { RowDataPacket } from 'mysql2'

export interface ServiceDTO extends RowDataPacket{
  id_service: string,
  name: string,
  cost: string
}