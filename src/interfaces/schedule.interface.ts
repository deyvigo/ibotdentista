import { RowDataPacket } from 'mysql2'

export interface ScheduleDTO extends RowDataPacket {
  id_schedule: string,
  day: string,
  start: string,
  end: string,
  id_doctor: string,
}
