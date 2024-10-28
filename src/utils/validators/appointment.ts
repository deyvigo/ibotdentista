import { WASocket } from '@whiskeysockets/baileys'
import { Session, SessionClientAppointment } from '../../interfaces/session.interface'
import { ScheduleRepository } from '../../repositories/schedule'
import { AppointmentRepository } from '../../repositories/appointment'
import chalk from 'chalk'

export interface DateFields {
  day: string,
  hour: string
}

export const appointmentIsPast = (
  sock: WASocket, dataClient: DateFields, from: string, session: Session
) => {
  const date = new Date(`${dataClient.day}T05:00:00.000Z`)
  const day = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date)
  const hour = dataClient.hour

  const actualDay = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(new Date())
  const actualHour = new Intl.DateTimeFormat('es-ES', { hour: 'numeric', minute: 'numeric' }).format(new Date())

  if (day === actualDay) {
    if (actualHour > hour) {
      session.step = 0
      session.flow = ''
      console.log(chalk.red('La cita no puede ser antes de la hora actual.'))
      sock.sendMessage(from!, { text: 'Lo siento, no podemos agendar la cita porque la fecha y hora elegida ya ha pasado.' })
      return true
    }
  }

  return false
}

export const appointmentInWorkHours = async (
  sock: WASocket, dataClient: DateFields, from: string, session: Session
) => {
  const date = new Date(`${dataClient.day}T05:00:00.000Z`)
  const day = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date)
  const hours = await ScheduleRepository.getByDay(day)
  const hour = `${dataClient.hour}:00`

  for (const { start, end } of hours) {
    if (start <= hour && hour < end) {
      return true
    }
  }
  
  session.step = 0
  session.flow = ''
  console.log(chalk.red('La cita no está dentro del horario de trabajo.'))
  sock.sendMessage(from!, { text: 'Lo siento, no podemos agendar la cita porque la hora elegida no está dentro del horario del doctor.' })
  return false
}

export const appointmentHourIsAvailable = async (
  sock: WASocket, dataClient: DateFields, from: string, session: Session
) => {
  const appointment = await AppointmentRepository.getByDayAndHour(dataClient.day, dataClient.hour)
  if (appointment.length > 0) {
    session.step = 0
    session.flow = ''
    sock.sendMessage(from!, { text: 'Lo siento, no podemos agendar la cita porque la hora elegida ya está ocupada.' })
    console.log(chalk.red('La hora escogida no está disponible.'))
    return false
  }

  return true
}