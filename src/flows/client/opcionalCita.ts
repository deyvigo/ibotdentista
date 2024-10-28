import { proto, WASocket } from '@whiskeysockets/baileys'
import { Session, SessionClientAppointmentOptional } from '@interfaces/session.interface'
import { sendText } from '@services/bot/sendText'
import { optionalAppointmentValidator } from '@/utils/validators/optionalAppointment'
import { appointmentHourIsAvailable, appointmentInWorkHours, appointmentIsPast } from '@/utils/validators/appointment'
import { askToAI } from '@/services/ai'
import { AppointmentRepository } from '@/repositories/appointment'
import { programNotify } from '@/services/schedule/programNotify'

export const optionalAppointment = async (socket: WASocket, messageInfo: proto.IWebMessageInfo, session: Session) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation || ''

  const clientPayload = session.payload as SessionClientAppointmentOptional

  switch (session.step) {
    case 0:
      if (
        !await optionalAppointmentValidator(
          socket, messageText, from, session,
          'una confirmación (puede ser sí, claro o algo parecido) para poder reprogramar la cita'
        )
      ) return

      session.step += 1

      await sendText(socket, from!, '¿Qué otro día puedes asistir a la cita?')
      break
    case 1:
      if (
        !await optionalAppointmentValidator(
          socket, messageText, from, session,
          'un día para agendar la cita (puede ser hoy, mañana, o un día de la semana, incluyendo los sábados, excepto domingos)'
        )
      ) return

      session.step += 1
      clientPayload.day = messageText
      session.payload = clientPayload

      await sendText(socket, from!, '¿A qué hora quieres la cita?')
      break
    case 2:
      if (
        !await optionalAppointmentValidator(
          socket, messageText, from, session,
          'una hora del día para asistir a la cita'
        )
      ) return

      clientPayload.hour = messageText
      session.payload = clientPayload

      await sendText(socket, from!, 'Gracias. Ahora cambiaré la fecha y hora de la cita.')

      const intructions = `
      Estas modificando la fecha y hora de una cita de un cliente.
      Debes analizar la información del cliente y generar un objeto JSON con la siguiente estructura:
      Esta es la información del cliente ${JSON.stringify(clientPayload)}
      {
        "day": "Día de la cita en formato YYYY-MM-DD. No puede ser un día pasado.",
        "hour": "Hora de la cita en formato HH:MM (24 horas).",
        "id_appointment": "ID de la cita del cliente"
      }
      `

      const response = await askToAI(intructions, 'json_object') as string
      const resJson = JSON.parse(response) as SessionClientAppointmentOptional

      // Date validationns
      if (appointmentIsPast(socket, { day: resJson.day, hour: resJson.hour }, from, session)) return
      if (!await appointmentInWorkHours(socket, { day: resJson.day, hour: resJson.hour }, from, session)) return
      if (!await appointmentHourIsAvailable(socket, { day: resJson.day, hour: resJson.hour }, from, session)) return

      const result = await AppointmentRepository.updateAppointmentById(resJson.id_appointment, resJson.day, resJson.hour)

      if (result === 'Su cita ha sido actualizada') {
        const appointment = await AppointmentRepository.getById(resJson.id_appointment)
        programNotify(socket, appointment[0], -30)
      }

      await sendText(socket, from, result)
      session.flow = ''
      session.step = 0
      session.payload = {}
      
      break
  }
}