import { proto, WASocket } from '@whiskeysockets/baileys'
import { Session, SessionClientAppointment } from '../../interfaces/session.interface'
import { AppointmentRepository } from '../../repositories/appointment'
import { sendText } from '../../services/bot/sendText'
import { clientResponseValidator } from '../../utils/validators/clientValidator'
import { formatDate } from '../../utils/formatDate'
import { askToAI } from '../../services/ai'
import { appointmentHourIsAvailable, appointmentInWorkHours, appointmentIsPast } from '../../utils/validators/appointment'
import { ClientRepository } from '../../repositories/client'
import { DoctorRepository } from '../../repositories/doctor'

export const askAppointment = async (socket: WASocket, messageInfo: proto.IWebMessageInfo, session: Session) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation || ''
  const clientNumber = from.split('@')[0] as string

  const clientPayload = session.payload as SessionClientAppointment

  // Only one appointment for phone number
  const dateExists = await AppointmentRepository.getAppointmentByClientNumber(clientNumber)

  if (dateExists.length > 0) {
    await sendText(socket, from!, 'Ya existe una cita para este número de teléfono. Por favor, revisa tu agenda.')
    session.flow = ''
    session.step = 0
    return
  }

  switch (session.step) {
    case 0:
      await sendText(socket, from!, 'Claro. Agendemos una cita.')
      await sendText(socket, from!, '¿Para qué día quieres la cita?')
      session.step += 1
      break
    case 1:
      if (
        await clientResponseValidator(socket, messageText, from, session, 'no tiene relación con fechas o días')
      ) return

      clientPayload.day = messageText
      session.payload = clientPayload
      session.step += 1

      await sendText(socket, from!, '¿A qué hora quieres la cita?')
      break
    case 2:
      if (
        await clientResponseValidator(socket, messageText, from, session, 'no contiene un número de hora o una hora')
      ) return

      clientPayload.hour = messageText
      session.payload = clientPayload
      session.step += 1

      await sendText(socket, from!, '¿Cuál es el número de DNI?')
      break
    case 3:
      if (
        await clientResponseValidator(socket, messageText, from, session, 'no tiene relación con un DNI (una cadena de 9 dígitos)')
      ) return

      clientPayload.dni = messageText
      session.payload = clientPayload
      session.step += 1

      await sendText(socket, from!, '¿Cuál es el motivo de la cita?')
      break
    case 4:
      if (
        await clientResponseValidator(socket, messageText, from, session, 'no es un motivo para ir al dentista')
      ) return

      clientPayload.reason = messageText
      session.payload = clientPayload
      session.step += 1

      await sendText(socket, from!, '¿Cuál es tu nombre completo?')
      break
    case 5:
      if (
        await clientResponseValidator(socket, messageText, from, session, 'no contiene un nombre')
      ) return

      clientPayload.fullname = messageText
      session.payload = clientPayload
      
      await sendText(socket, from!, 'Gracias. Ahora crearé la cita.')

      const prompt = `
      Siendo hoy ${formatDate(new Date())}.
      Tu tarea principal es analizar la información enviada por el cliente.
      Información del cliente: ${JSON.stringify(clientPayload)}
      Deber generar un objeto JSON con la siguiente estructura:
      {
        "day": "Día de la cita en formato YYYY-MM-DD. Llevar al día más cercano en el futuro.",
        "hour": "Hora de la cita en formato HH:MM (24 horas).",
        "dni": "DNI del cliente (cadena de 8 dígitos).",
        "fullname": "Nombre completo del cliente.",
        "reason": "Motivo de la cita."
      }
      Objeto JSON generado:
      `

      const data = await askToAI(prompt) as string
      const jsonData = JSON.parse(data) as SessionClientAppointment

      // comprobar que la hora y dia no sean pasados
      if (appointmentIsPast(socket, jsonData, from, session)) return

      // comprobar que la hora esté dentro del horario de trabajo
      if (!await appointmentInWorkHours(socket, jsonData, from, session)) return

      // comprobar que el horario no esté ocupado
      if (!await appointmentHourIsAvailable(socket, jsonData, from, session)) return

      const client = await ClientRepository.getClientByNumber(clientNumber)
      if (client.length === 0) {
        await ClientRepository.createClient({ phone: clientNumber, fullname: jsonData.fullname, dni: jsonData.dni })
      }

      const clientOnDB = await ClientRepository.getClientByNumber(clientNumber)
      const idClient = clientOnDB[0].id_client
      const doctor = await DoctorRepository.getDoctors()
      const idDoctor = doctor[0].id_doctor

      const result = await AppointmentRepository.createAppointment({ day: jsonData.day, hour: jsonData.hour, state: 'pending', reason: jsonData.reason, id_doctor: idDoctor, id_client: idClient })

      await sendText(socket, from!, result)

      if (result === 'Cita creada') {
        const doctorNumber = doctor[0].phone
        const doctorJid = `${doctorNumber}@s.whatsapp.net`
        // await sendText(socket, doctorJid, `Doctor, un cliente ha agendado una cita para el día ${jsonData.day}  a las ${jsonData.hour}.`)
      }

      // resetear el flujo
      session.flow = ''
      session.step = 0
      session.payload = {}
      break
  }
}