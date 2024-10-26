import { proto, WASocket } from '@whiskeysockets/baileys'
import { Session, SessionClientAppointment } from '@interfaces/session.interface'
import { sendText } from '@services/bot/sendText'
import { clientAskAppValidator } from '@utils/validators/clientValidator'
import { appointmentHourIsAvailable, appointmentInWorkHours, appointmentIsPast } from '@utils/validators/appointment'
import { askToAI } from '@services/ai'
import { deleteNotify, programNotify } from '@services/schedule/programNotify'
import { AppointmentRepository } from '@repositories/appointment'
import { deleteReminderChangeStatus, programChangeStatusAppointment } from '@services/schedule/programChangeStatus'
import { formatDate } from '@utils/formatDate'

export const modifyAppointment = async (
  socket: WASocket, messageInfo: proto.IWebMessageInfo, session: Session
) => {
  const from = messageInfo.key.remoteJid as string
  const clientNumber = from.split('@')[0] as string
  const messageText = messageInfo.message?.conversation || ''

  const appointments = await AppointmentRepository.getAppointmentByClientNumber(clientNumber)

  if (appointments.length === 0) {
    await sendText(socket, from!, 'No tienes citas pendientes para modificar.')
    session.flow = ''
    session.step = 0
    return
  }

  const clientPayload = session.payload as SessionClientAppointment

  switch (session.step) {
    case 0:
      sendText(socket, from!, '¿En qué nuevo día tienes disponibilidad para la cita?')
      session.step += 1
      break
    case 1:
      if (
        !await clientAskAppValidator(socket, messageText, from, session, 'un día para la cita (puede ser hoy también)')
      ) return

      clientPayload.day = messageText
      session.payload = clientPayload
      session.step += 1

      sendText(socket, from!, '¿En qué nueva hora tienes disponibilidad para la cita?')
      break
    case 2:
      if (
        !await clientAskAppValidator(socket, messageText, from, session, 'una hora del día para asistir a la cita')
      ) return

      clientPayload.hour = messageText
      session.payload = clientPayload

      const prompt = `
      Siendo hoy ${formatDate(new Date())}.
      Tu tarea principal es formatear los datos del cliente.
      Información del cliente: ${JSON.stringify(clientPayload)}
      Construye un objeto JSON con la siguiente estructura:
      {
        "day": "Día de la cita en formato YYYY-MM-DD. No puede ser un día pasado.",
        "hour": "Hora de la cita en formato HH:MM (24 horas).",
      }
      Responde solo el objeto JSON. No incluyas ningún otro texto. Ni delimitadores.
      Objeto JSON generado:
      `

      const dayHour = await askToAI(prompt, 'json_object') as string
      const jData = JSON.parse(dayHour) as SessionClientAppointment

      // comprobar que la hora y dia no sean pasados
      if (appointmentIsPast(socket, jData, from, session)) return

      // comprobar que la hora esté dentro del horario de trabajo
      if (!await appointmentInWorkHours(socket, jData, from, session)) return

      // comprobar que la hora de la cita no esté ocupada
      if (!await appointmentHourIsAvailable(socket, jData, from, session)) return

      // delete previous notifications and reminders to change status to attended
      deleteNotify(appointments[0])
      deleteNotify(appointments[0])

      // Update appointment
      const result = await AppointmentRepository.updateAppointmentById(appointments[0].id_appointment, jData.day, jData.hour)

      // get new appointment and program notifications and reminders
      const newAppointment = await AppointmentRepository.getAppointmentByClientNumber(clientNumber)
      if (newAppointment.length > 0) {
        programNotify(socket, newAppointment[0], -30)
        programChangeStatusAppointment(newAppointment[0], 'attended')
      }

      sendText(socket, from!, result)

      session.flow = ''
      session.step = 0
      session.payload = {}

      break
  }
}