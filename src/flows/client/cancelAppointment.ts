import { proto, WASocket } from '@whiskeysockets/baileys'
import { ClientRepository } from '../../repositories/client'
import { sendText } from '../../services/bot/sendText'
import { AppointmentRepository } from '../../repositories/appointment'
import { deleteNotify } from '../../services/schedule/programNotify'
import { deleteReminderChangeStatus } from '../../services/schedule/programChangeStatus'

export const cancelAppointment = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string
  const clientNumber = from.split('@')[0] as string

  const client = await ClientRepository.getClientByNumber(clientNumber)

  if (client.length === 0) {
    sendText(socket, from!, 'No tienes citas pendientes para cancelar.')
    return
  }

  const appointments = await AppointmentRepository.getAppointmentByClientNumber(clientNumber)
  console.log('appointments: ', appointments)
  
  // delete recordatory appointment recordatory and reminder change status
  for (const appointment of appointments) {
    deleteNotify(appointment)
    deleteReminderChangeStatus(appointment)
  }

  const result = await AppointmentRepository.deleteAppointmentByIdClient(client[0].id_client)

  sendText(socket, from!, result)
}