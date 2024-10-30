import { RowDataPacket } from 'mysql2'

export interface ClientDTO extends RowDataPacket {
  id_client: string,
  phone: string,
  full_name: string,
  dni: string
}

export interface CreateClientDTO {
  id_number: string,
  fullname: string,
  dni: string
}