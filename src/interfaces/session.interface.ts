export interface Session {
  step: number,
  flow: ClientFlow | DoctorFlow | '',
  payload: SessionDoctorSchedule | SessionClientAppointment | SessionDoctorService | {}
}

// Interface para que el doctor pueda cancelar citas de su horario
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

// Interface opcional para cuando el doctor le cancela la cita a un cliente y se le pide si quiere programar otra cita
export interface SessionClientAppointmentOptional {
  id_appointment: string,
  day: string,
  hour: string,
}

export type DoctorFlow = 'bienvenida' | 'horario' | 'ver-citas' | 'cancelar' | 'consultas' | 'crear-servicio' | 'informacion-bot'

export type ClientFlow = 'bienvenida' | 'servicios' | 'horario-doctor' | 'consultas' | 'solicitar-cita' | 'cancelar-cita' | 'citas-creadas' | 'informacion-bot' | 'direccion' | 'reprogramar-cita' | 'opcional-cita'
// 'opcional-cita' es para cuando el doctor le cancela la cita a un cliente y se le pide si quiere programar otra cita
