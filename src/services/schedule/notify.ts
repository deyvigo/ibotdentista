import { parseISO } from 'date-fns'
import schedule from 'node-schedule'
import { AppointmentClientDTO } from '../../interfaces/appointment.interface'
import { sendText } from '../bot/sendText'
import { WASocket } from '@whiskeysockets/baileys'
import { formatInTimeZone } from 'date-fns-tz'
import chalk from 'chalk'

const reminderJobs = new Map()

/**
  * @param {WASocket} socket WhatsApp Web Socket
  * @param {number} timePrev in minutes to remind the appointment
*/
export const programNotify = (socket: WASocket, appointment: AppointmentClientDTO, timePrev: number) => {
  const timeZone = 'America/Lima'
  const day = new Date(appointment.day).toISOString().split('T')[0]
  const date = parseISO(day + 'T' + appointment.hour)
  
  const dateReminder = new Date(date.getTime() + timePrev * 60 * 1000)

  const job = schedule.scheduleJob(dateReminder, async () => {
    const clientJid = `${appointment.phone}@s.whatsapp.net`
    await sendText(socket, clientJid, `¡Hola! Tu cita con el doctor es en 30 minutos. Por favor, revisa tu agenda.`)
    if (reminderJobs.has(appointment.id_appointment)) {
      reminderJobs.delete(appointment.id_appointment)
    }
  })

  reminderJobs.set(appointment.id_appointment, job)

  console.log(chalk.green(`Recordatorio programado: ${formatInTimeZone(dateReminder, timeZone, 'yyyy-MM-dd HH:mm')} 'para:' ${appointment.phone}`))
}

export const deleteNotify = (appointment: AppointmentClientDTO) => {
  const job = reminderJobs.get(appointment.id_appointment)
  if (!job) {
    console.log(chalk.red(`No se encontró el recordatorio para ${appointment.id_appointment}`))
    return
  }
  job.cancel()
  reminderJobs.delete(appointment.id_appointment)
  const day = new Date(appointment.day).toISOString().split('T')[0]
  const date = day + 'T' + appointment.hour
  console.log(chalk.green(`Recordatorio cancelado de cita: ${date} para: ${appointment.phone}`))
}