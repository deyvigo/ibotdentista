import { RowDataPacket } from 'mysql2'
import { DateState } from '@utils/date'

// Interface to get appointment from database
export interface AppointmentDTO extends RowDataPacket {
  id_appointment: string,
  day: string,
  hour: string,
  state: DateState,
  reason: string,
  id_doctor: string,
  id_client: string,
  modified_by_admin_id: string
}

export interface CreateAppointmentDTO {
  day: string,
  hour: string,
  state: DateState,
  reason: string,
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
  doctor_name: string,
  state: DateState,
  phone: string
}

// Interface to create appintments day schedule image
export interface AppointmentDoctorDTO extends RowDataPacket {
  full_name: string,
  dni: string,
  hour: string
  phone: string
  state: DateState
}

// To generate intervals for appointments
export interface AppointmentIntervalDTO {
  day: string,
  start: string,
  end: string
}