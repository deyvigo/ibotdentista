export interface Session {
  step: number,
  flow: ClientFlow | DoctorFlow | '',
  payload: SessionDoctorSchedule | SessionClientAppointment | SessionDoctorService | {}
}

// Interface para que el doctor pueda crear su horario
export interface SessionDoctorSchedule {
  day: string,
  start: string,
  end: string,
}

// Interface para que el cliente pueda crear una cita
export interface SessionClientAppointment {
  day: string,
  hour: string,
  dni: string,
  fullname: string,
  reason: string,
}

// Interface para que el doctor pueda crear un servicio
export interface SessionDoctorService {
  name: string,
  price: number
}

export type DoctorFlow = 'bienvenida' | 'horario' | 'citas' | 'cancelar' | 'consultas' | 'servicios'

export type ClientFlow = 'bienvenida' | 'servicios' | 'horario-doctor' | 'consultas' | 'solicitar-cita' | 'cancelar-cita' | 'citas-creadas'
