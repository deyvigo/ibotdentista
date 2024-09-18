import { proto, WASocket } from '@whiskeysockets/baileys'
import { ScheduleRepository } from '../../repositories/schedule'
import { sendText } from '../../services/bot/sendText'
import { createScheduleImage } from '../../services/images/createScheduleImage'
import { sendImage } from '../../services/bot/sendImage'

export const scheduleDoctor = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string
  const schedule = await ScheduleRepository.getSchedule()

  if (schedule.length === 0) {
    await sendText(socket, from!, 'No hay horarios disponibles')
    return
  }

  await sendText(socket, from!, 'Este es tu horario de trabajo:')

  const scheduleImage = createScheduleImage(schedule)

  await sendImage(socket, from!, scheduleImage)
}