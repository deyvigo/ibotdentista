import { proto, WASocket } from '@whiskeysockets/baileys'
import { formatDate } from '@utils/formatDate'
import { askToAI } from '@services/ai'
import { AppointmentRepository } from '@repositories/appointment'
import { createWeekScheduleImage } from '@/services/images/createWeekScheduleImage'
import { sendImage } from '@services/bot/sendImage'
import { sendText } from '@services/bot/sendText'
import { dateToDay } from '@/utils/someFunctions.ts/dateToDay'
import { weekToString } from '@/utils/someFunctions.ts/weekToString'

export const viewWeekSchedule = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation || ''

  const instructions = `
  Siendo hoy ${formatDate(new Date())}.
  El dentista te está pidiendo le muestres su horario de trabajo de la semana.
  Debes responder un obejto JSON con la siguiente estructura:
  {
    weekInit: "Día de la semana en formato YYYY-MM-DD. Debe ser un lunes de la semana que hace referencia el usuario.",
    weekEnd: "Día de la semana en formato YYYY-MM-DD. Debe ser un sábado de la semana que hace referencia el usuario."
  }
  `

  const response = await askToAI(messageText, 'json_object', instructions) as string
  const jsonResponse = JSON.parse(response) as { weekInit: string, weekEnd: string }

  const daySchedule = await AppointmentRepository.getAllPerWeek(jsonResponse)
  const dataDays = dateToDay(daySchedule)

  const imgBuffer = await createWeekScheduleImage(weekToString(jsonResponse), dataDays)

  await sendText(socket, from!, 'Este es el horario de la semana:')
  await sendImage(socket, from!, imgBuffer)
}
