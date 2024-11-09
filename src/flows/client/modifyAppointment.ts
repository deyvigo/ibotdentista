import { proto, WASocket } from '@whiskeysockets/baileys'
import { Session, SessionClientAppointmentModification } from '@interfaces/session.interface'
import { sendText } from '@services/bot/sendText'
import { clientAskAppValidator } from '@utils/validators/clientValidator'
import { appointmentHourIsAvailable, appointmentInWorkHours, appointmentIsPast } from '@utils/validators/appointment'
import { askToAI } from '@services/ai'
import { deleteNotify, programNotify } from '@services/schedule/programNotify'
import { AppointmentRepository } from '@repositories/appointment'
import { formatDate } from '@utils/formatDate'
import { cancelAppointmentValidator } from '@/utils/validators/cancelAppointment'
import { DoctorRepository } from '@/repositories/doctor'
import { takeDayAndCreateImageDisponibility } from '@/utils/someFunctions.ts/takeDayAndCreateImage'
import { sendImage } from '@/services/bot/sendImage'

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

  const clientPayload = session.payload as SessionClientAppointmentModification

  switch (session.step) {
    case 0:
      await sendText(socket, from!, 'Las citas se modificar por DNI.')
      await sendText(socket, from!, '¿Cuál es el DNI? (Ingresa solo los números)')
      session.step += 1
      break
    case 1:
      if (!await cancelAppointmentValidator(socket, messageText, from, session)) return
      const match = messageText.match(/\d+/)
      if (match) {
        const dni = match[0]
        clientPayload.dni = dni
        const appointments = await AppointmentRepository.getPendingAppointmentsByDni(dni)
        if (appointments.length <= 0) {
          await sendText(socket, from!, 'No tienes citas pendientes para modificar.')
          session.step = 0
          session.flow = ''
          session.payload = {}
          return
        }
      }

      session.payload = clientPayload
      session.step += 1

      sendText(socket, from!, '¿En qué nuevo día tienes disponibilidad para la cita?')
      break
    case 2:
      if (
        !await clientAskAppValidator(socket, messageText, from, session, 'un día para la cita (puede ser hoy también)')
      ) return

      // send image with available hours for the day
      const doc = await DoctorRepository.getDoctors()
      const idDoc = doc[0].id_doctor
      const imageBuffer = await takeDayAndCreateImageDisponibility(messageText, idDoc)
      await sendImage(socket, from!, imageBuffer)

      clientPayload.day = messageText
      session.payload = clientPayload
      session.step += 1

      sendText(socket, from!, '¿En qué nueva hora tienes disponibilidad para la cita?')
      break
    case 3:
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
        "dni": "DNI del cliente (cadena de 8 dígitos).",
        "day": "Día de la cita en formato YYYY-MM-DD. No puede ser un día pasado.",
        "hour": "Hora de la cita en formato HH:MM (24 horas).",
      }
      Responde solo el objeto JSON. No incluyas ningún otro texto. Ni delimitadores.
      Objeto JSON generado:
      `

      const response = await askToAI(prompt, 'json_object') as string
      const jData = JSON.parse(response) as SessionClientAppointmentModification

      // comprobar que la hora y dia no sean pasados
      if (appointmentIsPast(socket, jData, from, session)) return

      // comprobar que la hora esté dentro del horario de trabajo
      if (!await appointmentInWorkHours(socket, jData, from, session)) return

      // comprobar que la hora de la cita no esté ocupada
      if (!await appointmentHourIsAvailable(socket, jData, from, session)) return

      // get pendings appointment by dni
      const appointments = await AppointmentRepository.getPendingAppointmentsByDni(jData.dni)

      // delete previous notifications and reminders to change status to attended
      deleteNotify(appointments[0])

      // Update appointment
      const result = await AppointmentRepository.updateAppointmentById(appointments[0].id_appointment, jData.day, jData.hour)

      // get new appointment and program notifications and reminders
      const newAppointment = await AppointmentRepository.getAppointmentByClientNumber(clientNumber)
      if (newAppointment.length > 0) {
        programNotify(socket, newAppointment[0], -30)
      }

      sendText(socket, from!, result)

      session.flow = ''
      session.step = 0
      session.payload = {}

      break
  }
}