import { proto, WASocket } from '@whiskeysockets/baileys'
import { AppointmentRepository } from '../../repositories/appointment'
import { sendText } from '../../services/bot/sendText'
import { createAppointmentImage } from '../../services/images/createAppointmentImage'
import { sendImage } from '../../services/bot/sendImage'

export const consultAppointment = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string

  const clientNumber = from.split('@')[0] as string

  const listAppointments = await AppointmentRepository.getAppointmentByClientNumber(clientNumber)

  if (listAppointments.length === 0) {
    await sendText(socket, from!, 'No tienes citas pendientes.')
    return
  }

  const imgBuffer = createAppointmentImage(listAppointments[0])

  await sendText(socket, from!, 'Claro. Aquí está la cita que tienes pendiente.')
  await sendImage(socket, from!, imgBuffer)
}