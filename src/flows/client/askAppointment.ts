import { proto, WASocket } from '@whiskeysockets/baileys'
import { Session, SessionClientAppointment } from '../../interfaces/session.interface'
import { AppointmentRepository } from '../../repositories/appointment'
import { sendText } from '../../services/bot/sendText'
import { clientAskAppValidator } from '../../utils/validators/clientValidator'
import { formatDate } from '../../utils/formatDate'
import { askToAI } from '../../services/ai'
import { appointmentHourIsAvailable, appointmentInWorkHours, appointmentIsPast } from '../../utils/validators/appointment'
import { ClientRepository } from '../../repositories/client'
import { DoctorRepository } from '../../repositories/doctor'
import { programNotify } from '../../services/schedule/programNotify'
import { programChangeStatusAppointment } from '../../services/schedule/programChangeStatus'

export const askAppointment = async (socket: WASocket, messageInfo: proto.IWebMessageInfo, session: Session) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation || ''
  const clientNumber = from.split('@')[0] as string

  const clientPayload = session.payload as SessionClientAppointment

  // Only one appointment per phone number
  const appointmentExists = await AppointmentRepository.getAppointmentByClientNumber(clientNumber)

  if (appointmentExists.length > 0) {
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
      // TODO: Aprovechando que se dio el día de la cita, traer una imagen con los horarios disponibles para ese día
      if (
        !await clientAskAppValidator(socket, messageText, from, session, 'Ahora le estás pidiendo un día para agendar la cita (puede ser hoy, mañana, o un día de la semana, incluyendo los sábados, excepto domingos)')
      ) return

      clientPayload.day = messageText
      session.payload = clientPayload
      session.step += 1

      await sendText(socket, from!, '¿A qué hora quieres la cita?')
      break
    case 2:
      if (
        !await clientAskAppValidator(socket, messageText, from, session, 'una hora del día para asistir a la cita')
      ) return

      clientPayload.hour = messageText
      session.payload = clientPayload
      session.step += 1

      const prompt = `
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

      console.log('jData: ', jData)

      // comprobar que la hora y dia no sean pasados
      if (appointmentIsPast(socket, jData, from, session)) return

      // comprobar que la hora esté dentro del horario de trabajo
      if (!await appointmentInWorkHours(socket, jData, from, session)) return

      // comprobar que la hora de la cita no esté ocupada
      if (!await appointmentHourIsAvailable(socket, jData, from, session)) return

      await sendText(socket, from!, '¿Cuál es el motivo de la cita?')
      break
    case 3:
      if (
        !await clientAskAppValidator(socket, messageText, from, session, 'un motivo para la cita')
      ) return

      clientPayload.reason = messageText
      session.payload = clientPayload
      session.step += 1

      await sendText(socket, from!, '¿Cuál es el número de DNI?')
      break
    case 4:
      if (
        !await clientAskAppValidator(socket, messageText, from, session, 'el número de DNI (cadena de 8 dígitos)')
      ) return

      clientPayload.dni = messageText
      session.payload = clientPayload
      session.step += 1

      await sendText(socket, from!, '¿Cuál es tu nombre completo?')
      break
    case 5:
      if (
        !await clientAskAppValidator(socket, messageText, from, session, 'un nombre')
      ) return

      clientPayload.fullname = messageText
      session.payload = clientPayload
      
      await sendText(socket, from!, 'Gracias. Ahora crearé la cita.')

      const message = `
      Siendo hoy ${formatDate(new Date())}.
      Tu tarea principal es analizar la información enviada por el cliente.
      Información del cliente: ${JSON.stringify(clientPayload)}
      Tu tarea principal es analizar la información del cliente y generar un objeto JSON con la siguiente estructura:
      {
        "day": "Día de la cita en formato YYYY-MM-DD. No puede ser un día pasado.",
        "hour": "Hora de la cita en formato HH:MM (24 horas).",
        "dni": "DNI del cliente (cadena de 8 dígitos).",
        "fullname": "Nombre completo del cliente.",
        "reason": "Motivo de la cita."
      }
      Responde solo con el objeto JSON. No incluyas ningún otro texto. Ni delimitadores.
      Objeto JSON generado:
      `

      const data = await askToAI(message, 'json_object') as string

      const jsonData = JSON.parse(data) as SessionClientAppointment

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
        // send notification to doctor
        const doctorNumber = doctor[0].phone
        const doctorJid = `${doctorNumber}@s.whatsapp.net`
        await sendText(socket, doctorJid, `Doctor, un cliente ha agendado una cita para el día ${jsonData.day}  a las ${jsonData.hour}.`)

        // establish reminder to change status to attended and send notification to client
        const appointment = await AppointmentRepository.getAppointmentByClientNumber(clientNumber)
        console.log('appointment: ', appointment)
        if (appointment.length > 0) {
          programNotify(socket, appointment[0], -30)
          programChangeStatusAppointment(appointment[0], 'attended')
        }
      }

      // resetear el flujo
      session.flow = ''
      session.step = 0
      session.payload = {}
      break
  }
}