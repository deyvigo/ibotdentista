import { proto, WASocket } from '@whiskeysockets/baileys'
import { Session, SessionClientAppointmentOptional } from '@interfaces/session.interface'
import { sendText } from '@services/bot/sendText'
import { optionalAppointmentValidator } from '@/utils/validators/optionalAppointment'
import { appointmentHourIsAvailable, appointmentInWorkHours, appointmentIsPast } from '@/utils/validators/appointment'
import { askToAI } from '@/services/ai'
import { AppointmentRepository } from '@/repositories/appointment'
import { deleteNotify, programNotify } from '@/services/schedule/programNotify'
import { DoctorRepository } from '@/repositories/doctor'
import { takeDayAndCreateImageDisponibility } from '@/utils/someFunctions.ts/takeDayAndCreateImage'
import { sendImage } from '@/services/bot/sendImage'

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

      // Send image with available hours for the day
      const doc = await DoctorRepository.getDoctors()
      const idDoc = doc[0].id_doctor
      const imageBuffer = await takeDayAndCreateImageDisponibility(messageText, idDoc)
      await sendImage(socket, from!, imageBuffer)

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

      const previousAppointment = await AppointmentRepository.getAppointmentDTOById(resJson.id_appointment)
      if (previousAppointment.length <= 0) {
        await sendText(socket, from!, 'No tienes citas pendientes para cambiar la fecha y hora')
        session.flow = ''
        session.step = 0
        session.payload = {}
        return
      }
      const result = await AppointmentRepository.insertCanceledAppointmentOnAnotherDate(previousAppointment[0], resJson.day, resJson.hour)

      if (result === 'Su cita ha sido actualizada') {
        const appointment = await AppointmentRepository.getById(resJson.id_appointment)
        deleteNotify(appointment[0])
        // program new notify
        const newAppointment = await AppointmentRepository.getAppointmentByClientNumber(from.split('@')[0])
        await sendText(socket, newAppointment[0].doctor_number, 'Un cliente ha reprogramado su cita, revisa tu agenda.')
        programNotify(socket, newAppointment[0], -30)
      }

      await sendText(socket, from, result)
      session.flow = ''
      session.step = 0
      session.payload = {}
      
      break
  }
}