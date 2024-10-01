import { proto, WASocket } from '@whiskeysockets/baileys'
import { formatDate } from '../../utils/formatDate'
import { askToAI } from '../../services/ai'
import { AppointmentRepository } from '../../repositories/appointment'
import { createDayScheduleImage } from '../../services/images/createDayScheduleImage'
import { sendImage } from '../../services/bot/sendImage'
import { sendText } from '../../services/bot/sendText'

export const viewDaySchedule = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation || ''

  const instructions = `
  Siendo hoy ${formatDate(new Date())}.
  El dentista te está pidiendo le muestres su horario de trabajo de un día.
  Debes responder solo la fecha en formato yyyy-mm-dd.
  Lleva la fecha al día más cercano en el futuro.
  En caso de que el cliente no haga referecia a una fecha, responde con la fecha actual.
  `

  const aiResponse = await askToAI(messageText, instructions) as string
  const daySchedule = await AppointmentRepository.getAllByDay(aiResponse)

  const imgBuffer = createDayScheduleImage(formatDate(new Date(aiResponse + 'T00:00:00')), daySchedule)

  await sendText(socket, from!, 'Este es el horario del día:')
  await sendImage(socket, from!, imgBuffer)
}