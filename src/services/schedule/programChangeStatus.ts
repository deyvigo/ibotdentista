import { parseISO } from 'date-fns'
import { AppointmentClientDTO } from '../../interfaces/appointment.interface'
import schedule from 'node-schedule'
import { AppointmentRepository } from '../../repositories/appointment'
import chalk from 'chalk'
import { DateState } from '../../utils/date'
import { formatInTimeZone } from 'date-fns-tz'

const deleteJobs = new Map()

export const programChangeStatusAppointment = (appointment: AppointmentClientDTO, status: DateState) => {
  const day = new Date(appointment.day).toISOString().split('T')[0]
  const dateInTimeZone = day + 'T' + appointment.hour
  const date = parseISO(dateInTimeZone)

  // one hour before the appointment change the status to 
  const dateChangeReminder = new Date(date.getTime() + 60 * 60 * 1000)

  const job = schedule.scheduleJob(dateChangeReminder, async () => {
    const idAppointment = appointment.id_appointment
    await AppointmentRepository.changeStatusById(idAppointment, status)
  })

  deleteJobs.set(appointment.id_appointment, job)

  console.log(chalk.cyan(`La cita ${dateInTimeZone} cambiará de estado a "attended" en ${formatInTimeZone(dateChangeReminder, 'America/Lima', 'yyyy-MM-dd HH:mm')}`))
}

export const deleteReminderChangeStatus = (appointment: AppointmentClientDTO) => {
  const job = deleteJobs.get(appointment.id_appointment)
  if (!job) return
  job.cancel()
  deleteJobs.delete(appointment.id_appointment)
  const day = new Date(appointment.day).toISOString().split('T')[0]
  const dateInTimeZone = day + 'T' + appointment.hour
  console.log(chalk.cyan(`El recordatorio de cambio de estado de la cita ${dateInTimeZone} ha sido cancelado`))
}