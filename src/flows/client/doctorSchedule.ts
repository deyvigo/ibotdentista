import { proto, WASocket } from '@whiskeysockets/baileys'
import { ScheduleRepository } from '../../repositories/schedule'
import { sendText } from '../../services/bot/sendText'
import { createScheduleImage } from '../../services/images/createScheduleImage'
import { sendImage } from '../../services/bot/sendImage'

export const doctorSchedule = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string

  const schedule = await ScheduleRepository.getSchedule()
  
  if (schedule.length === 0) {
    await sendText(socket, from!, 'No hay horarios de trabajo disponibles.')
    return
  }

  const imgBufferSch = createScheduleImage(schedule)

  await sendText(socket, from!, 'Aquí tienes el horario de trabajo del dentista:')
  await sendImage(socket, from!, imgBufferSch)
}