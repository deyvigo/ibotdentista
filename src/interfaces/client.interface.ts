import { RowDataPacket } from 'mysql2'

export interface ClientDTO extends RowDataPacket {
  id_client: string,
  phone: string,
  full_name: string,
  dni: string
}

export interface CreateClientDTO {
  phone: string,
  fullname: string,
  dni: string
}