import { proto, WASocket } from '@whiskeysockets/baileys'
import { formatDate } from '../../utils/formatDate'
import { askToAI } from '../../services/ai'
import { AppointmentRepository } from '../../repositories/appointment'
import { createDayScheduleImage } from '../../services/images/createDayScheduleImage'
import { sendImage } from '../../services/bot/sendImage'

export const viewDaySchedule = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation || ''

  const promp = `
  Siendo hoy ${formatDate(new Date())}.
  El dentista te está pidiendo le muestres su horario de trabajo de un día.
  Este es el mensaje del dentista: ${messageText}
  Debes responder solo la fecha en formato yyyy-mm-dd.
  En caso de que el cliente no haga referecia a una fecha, responde con la fecha actual.
  `

  const aiResponse = await askToAI(promp) as string
  // console.log('aiResponse: ', aiResponse)
  const daySchedule = await AppointmentRepository.getAllByDay(aiResponse)
  // console.log(daySchedule)

  const imgBuffer = createDayScheduleImage(formatDate(new Date(aiResponse + 'T00:00:00')), daySchedule)

  await sendImage(socket, from!, imgBuffer)
}