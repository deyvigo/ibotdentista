import { RowDataPacket } from 'mysql2'

export interface Doctor extends RowDataPacket {
  id_doctor: string
  phone: string
  first_name: string
  last_name: string
}
