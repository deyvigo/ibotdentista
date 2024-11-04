import { proto, WASocket } from '@whiskeysockets/baileys'
import { AppointmentRepository } from '@repositories/appointment'
import { sendText } from '@services/bot/sendText'
import { sendImage } from '@services/bot/sendImage'
import { createImageAppointmentsClient } from '@services/images/appointmentsClient'

export const consultAppointment = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string

  const clientNumber = from.split('@')[0] as string

  const listAppointments = await AppointmentRepository.getAppointmentByClientNumber(clientNumber)

  if (listAppointments.length === 0) {
    await sendText(socket, from!, 'No tienes citas pendientes.')
    return
  }

  console.log('listAppointments: ', listAppointments)
  const imgBuffer = await createImageAppointmentsClient(listAppointments)

  await sendText(socket, from!, 'Claro. Aquí tienes tus citas pendientes.')
  await sendImage(socket, from!, imgBuffer)
}