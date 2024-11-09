import { proto, WASocket } from '@whiskeysockets/baileys'
import { Session, SessionDoctorSchedule, SessionClientAppointmentOptional } from '@interfaces/session.interface'
import { sendText } from '@services/bot/sendText'
import { askToAI } from '@services/ai'
import { AppointmentRepository } from '@repositories/appointment'
import { DoctorRepository } from '@repositories/doctor'
import { doctorTakeDayFreeValidator } from '@utils/validators/doctorValidator'
import { deleteNotify } from '@services/schedule/programNotify'
import { AppointmentIntervalDTO } from '@/interfaces/appointment.interface'
import { generateIntervals } from '@/utils/generateIntervals'
import { BlockTimeRepository } from '@/repositories/blockTime'
import { userSession } from '../client/main'

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
        !await doctorTakeDayFreeValidator(
          socket, messageText, from, session,
          'un día de la semana (lunes, martes, etc), una fecha o un sustantivo que haga referencia a un día (mañana, pasado, ayer, hoy, etc)'
        )
      ) return

      doctorPayload.day = messageText.toLocaleLowerCase()
      session.payload = doctorPayload
      await sendText(socket, from!, '¿Desde qué hora?')
      session.step += 1

      break
    case 2:
      if (
        !await doctorTakeDayFreeValidator(
          socket, messageText, from, session,
          'una hora inicial para cancelar las citas o solo un número que represente una hora del día'
        )
      ) return

      doctorPayload.start = messageText
      session.payload = doctorPayload
      await sendText(socket, from!, '¿Hasta qué hora?')
      session.step += 1

      break
    case 3:
      if (
        !await doctorTakeDayFreeValidator(
          socket, messageText, from, session,
          `una hora del día mayor a ${doctorPayload.start} en cualquier formato`)
      ) return

      doctorPayload.end = messageText
      session.payload = doctorPayload

      sendText(socket, from!, 'Gracias. Ahora cancelaré las citas dentro de ese intervalo de tiempo.')

      const message = `
      Tu tarea principal es analizar la información enviada por el dentista.
      Información del dentista: ${JSON.stringify(doctorPayload)}
      Debes generar un objeto JSON con la siguiente estructura teniendo en cuenta la información del dentista.
      Ejemplo de estructura del arreglo:
      {
        "day": "Día en formato YYYY-MM-DD. Llevar al día más cercano en el futuro",
        "start": "Hora de inicio en formato HH:MM:00 (24 horas)",
        "end": "Hora final en formato HH:MM:00 (24 horas)",
      }
      `

      const data = await askToAI(message, 'json_object') as string
      const jsonData = JSON.parse(data) as AppointmentIntervalDTO

      const intervals = generateIntervals(jsonData)

      // Para avisar a los usuarios que se les canceló la cita
      const appoints = await AppointmentRepository.getByDayAndHourInteval(intervals[0].day, intervals[0].start, intervals[intervals.length - 1].end)

      const doctor = await DoctorRepository.getDoctors()
      const idDoctor = doctor[0].id_doctor

      const result = await AppointmentRepository.cancelDayInterval(intervals, idDoctor)

      if (!result) {
        await sendText(socket, from!, 'No se pudo cancelar las citas. Por favor, inténtalo de nuevo.')
        session.step = 0
        session.flow = ''
        session.payload = {}
        return
      }

      // Insert on blocktime table the intervals that were cancelled
      for await (const interval of intervals) {
        const { day, start, end } = interval
        await BlockTimeRepository.createBlockTime({ day, start, end, id_doctor: idDoctor })
      }

      for await (const appointment of appoints) {
        const number = appointment.phone + '@s.whatsapp.net'
        await sendText(socket, number, 'Se ha cancelado tu cita por motivos personales del doctor.')

        // delete notifications
        deleteNotify(appointment)

        // create a session client to new flow to update the appointment
        const appointmentOptional: SessionClientAppointmentOptional = {
          id_appointment: appointment.id_appointment,
          day: '',
          hour: ''
        }

        const numberClient = appointment.phone + '@s.whatsapp.net'
        userSession.set(numberClient, { step: 0, flow: 'opcional-cita', payload: appointmentOptional })
        await sendText(socket, numberClient, '¿Quieres reprogramar tu cita?')
      }

      await sendText(socket, from!, 'Las citas han sido canceladas.')
      session.step = 0
      session.flow = ''
      session.payload = {}

      break
  }
}