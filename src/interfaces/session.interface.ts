export interface Session {
  step: number,
  flow: ClientFlow | DoctorFlow | '',
  payload: SessionDoctorSchedule | SessionClientAppointment | SessionDoctorService | {}
}

export interface SessionDoctorSchedule {
  day: string,
  start: string,
  end: string,
}

export interface SessionClientAppointment {
  day: string,
  hour: string,
  dni: string,
  fullname: string,
  issue: string,
}

export interface SessionDoctorService {
  name: string,
  price: number
}

export type DoctorFlow = 'saludo' | 'horario' | 'citas' | 'cancelar' | 'consultas' | 'servicios'

export type ClientFlow = 'saludo' | 'servicios' | 'horario-doctor' | 'consultas' | 'solicitar-cita' | 'cancelar-cita' | 'citas-creadas'
