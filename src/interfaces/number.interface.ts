import { RowDataPacket } from 'mysql2'

export interface NumberDTO extends RowDataPacket {
  id_number: string,
  phone: string
}