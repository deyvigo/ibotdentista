import { RowDataPacket } from 'mysql2'

export interface BlockTimeCreateDTO {
  day: string,
  start: string,
  end: string
  id_doctor: string
}

export interface BlockTimeDTO extends RowDataPacket {
  id_blocktime: string,
  day: string,
  start: string,
  end: string,
  id_doctor: string
}