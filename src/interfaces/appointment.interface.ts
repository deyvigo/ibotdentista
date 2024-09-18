import { RowDataPacket } from 'mysql2'
import { DateState } from './../utils/date'

// Interface to get appointment from database
export interface AppointmentDTO extends RowDataPacket {
  id_appointment: string,
  day: string,
  hour: string,
  state: DateState,
  id_doctor: string,
  id_client: string
}

export interface CreateAppointmentDTO {
  day: string,
  hour: string,
  state: DateState,
  id_doctor: string,
  id_client: string
}

// Interface to get appointment with client from database
export interface AppointmentClientDTO extends RowDataPacket {
  id_appointment: string,
  day: string,
  hour: string,
  dni: string,
  fullname: string,
  doctor: string
}
