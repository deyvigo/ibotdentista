import { proto, WASocket } from '@whiskeysockets/baileys'
import { ClientRepository } from '../../repositories/client'
import { sendText } from '../../services/bot/sendText'
import { AppointmentRepository } from '../../repositories/appointment'
import { deleteNotify } from '../../services/schedule/notify'

export const cancelAppointment = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string
  const clientNumber = from.split('@')[0] as string

  const client = await ClientRepository.getClientByNumber(clientNumber)

  if (client.length === 0) {
    sendText(socket, from!, 'No tienes una cita para cancelar.')
    return
  }

  const appointments = await AppointmentRepository.getAppointmentByClientNumber(clientNumber)
  
  for (const appointment of appointments) {
    deleteNotify(appointment)
  }

  const result = await AppointmentRepository.deleteAppointmentByIdClient(client[0].id_client)

  sendText(socket, from!, result)
}