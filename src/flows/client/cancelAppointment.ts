import { proto, WASocket } from '@whiskeysockets/baileys'
import { ClientRepository } from '@repositories/client'
import { sendText } from '@services/bot/sendText'
import { AppointmentRepository } from '@repositories/appointment'
import { deleteNotify } from '@services/schedule/programNotify'
import { Session } from '@/interfaces/session.interface'
import { cancelAppointmentValidator } from '@/utils/validators/cancelAppointment'

export const cancelAppointment = async (socket: WASocket, messageInfo: proto.IWebMessageInfo, session: Session) => {
  const from = messageInfo.key.remoteJid as string
  const clientNumber = from.split('@')[0] as string
  const messageText = messageInfo.message?.conversation || ''

  const client = await ClientRepository.getClientByNumber(clientNumber)

  if (client.length === 0) {
    sendText(socket, from!, 'No tienes citas pendientes para cancelar.')
    return
  }

  switch (session.step) {
    case 0:
      await sendText(socket, from!, 'Se eliminarán todas las citas pendientes para el DNI.')
      await sendText(socket, from!, '¿Cuál es el DNI? (Ingresa solo los números)')
      session.step += 1
      break
    case 1:
      if (!await cancelAppointmentValidator(socket, messageText, from, session)) return

      const match = messageText.match(/\d+/)
      if (match) {
        const dni = match[0]
        const appointments = await AppointmentRepository.getPendingAppointmentsByDni(dni)
        if (appointments.length <= 0) {
          await sendText(socket, from!, 'No tienes citas pendientes para cancelar.')
          session.step = 0
          session.flow = ''
          session.payload = {}
          return
        }

        // delete recordatory appointment recordatory and reminder change status
        for (const appointment of appointments) {
          deleteNotify(appointment)
        }

        const result = await AppointmentRepository.deletePendingsAppointmentByDni(dni)
        await sendText(socket, from!, result)
      }

      // resetear el flujo
      session.flow = ''
      session.step = 0
      session.payload = {}
      break
  }
}