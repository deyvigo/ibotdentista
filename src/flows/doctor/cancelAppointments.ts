import { proto, WASocket } from '@whiskeysockets/baileys'
import { Session, SessionDoctorSchedule } from '../../interfaces/session.interface'
import { sendText } from '../../services/bot/sendText'
import { formatDate } from '../../utils/formatDate'
import { askToAI } from '../../services/ai'
import { AppointmentRepository } from '../../repositories/appointment'
import { DoctorRepository } from '../../repositories/doctor'
import { doctorServiceValidator } from '../../utils/validators/doctorValidator'
import { deleteNotify } from '../../services/schedule/programNotify'
import { deleteReminderChangeStatus } from '../../services/schedule/programChangeStatus'

export const cancelAppointments = async (
  socket: WASocket, messageInfo: proto.IWebMessageInfo, session: Session
) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation || ''

  const doctorPayload = session.payload as SessionDoctorSchedule

  switch (session.step) {
    case 0:
      await sendText(socket, from!, 'Claro. Cancelemos las citas.')
      await sendText(socket, from!, '¿Qué día quieres cancelar?')

      session.step += 1
      break
    case 1:
      if (
        !await doctorServiceValidator(socket, messageText, from, session, 'un día de la semana o un día o una fecha (puede ser hoy)')
      ) return

      doctorPayload.day = messageText.toLocaleLowerCase()
      session.payload = doctorPayload
      await sendText(socket, from!, '¿Desde qué hora?')
      session.step += 1

      break
    case 2:
      if (
        !await doctorServiceValidator(socket, messageText, from, session, 'un número de hora o una hora')
      ) return

      doctorPayload.start = messageText
      session.payload = doctorPayload
      await sendText(socket, from!, '¿Hasta qué hora?')
      session.step += 1

      break
    case 3:
      if (
        !await doctorServiceValidator(socket, messageText, from, session, 'un número de hora o una hora')
      ) return

      doctorPayload.end = messageText
      session.payload = doctorPayload

      sendText(socket, from!, 'Gracias. Ahora cancelaré las citas dentro de ese intervalo de tiempo.')

      const message = `
      Siendo hoy ${formatDate(new Date())}.
      Tu tarea principal es analizar la información enviada por el dentista.
      Información del dentista: ${JSON.stringify(doctorPayload)}
      Debes generar un objeto JSON con la siguiente estructura teniendo en cuenta la información del dentista.
      Ignora los intervalos 12-1 y 1-2 de la tarde porque son horarios de almuerzo.
      Debes considerar intervalos de 1 hora de tiempo en cada objeto del arreglo:
      [
        {
          "day": "Día en formato YYYY-MM-DD. Llevar al día más cercano en el futuro",
          "start": "Hora de inicio en formato HH:MM (24 horas)",
          "end": "Hora final en formato HH:MM (24 horas)",
        },
      ]
      Responde solo el arrego del objeto JSON. No incluyas ningún otro texto ni ningún delimitador.
      Objeto JSON generado:
      `

      const data = await askToAI(message, 'json_object') as string

      console.log('data: ', data)
      const jsonData = JSON.parse(data) as SessionDoctorSchedule[]

      console.log('jsonData: ', jsonData)

      // Para avisar a los usuarios que se les canceló la cita
      const appoints = await AppointmentRepository.getByDayAndHourInteval(jsonData[0].day, jsonData[0].start, jsonData[jsonData.length - 1].end)
      console.log('appoints: ', appoints)

      const doctor = await DoctorRepository.getDoctors()
      const idDoctor = doctor[0].id_doctor

      const result = await AppointmentRepository.cancelDayInterval(jsonData, idDoctor)

      if (!result) {
        await sendText(socket, from!, 'No se pudo cancelar las citas. Por favor, inténtalo de nuevo.')
        session.step = 0
        session.flow = ''
        session.payload = {}
        return
      }

      if (result) {
        for (const appointment of appoints) {
          const number = appointment.phone + '@s.whatsapp.net'
          await sendText(socket, number, 'Se ha cancelado tu cita por motivos personales del doctor.')

          // delete notifications and reminders to change status to attended
          deleteNotify(appointment)
          deleteReminderChangeStatus(appointment)

          // TODO: create a session client to new flow to update the appointment
        }
      }

      await sendText(socket, from!, 'Las citas han sido canceladas.')
      session.step = 0
      session.flow = ''
      session.payload = {}

      break
  }
}