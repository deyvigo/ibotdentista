import { proto, WASocket } from '@whiskeysockets/baileys'
import { sendText } from '../../services/bot/sendText'

export const informationClientBot = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string

  await sendText(socket, from!, 'Las acciones con las que te puedo ayudar son:')
  
  await sendText(socket, from!, 'Consultar el horario de trabajo del doctor.')
  await sendText(socket, from!, 'Ver las citas que tienes pendientes.')
  await sendText(socket, from!, 'Agendar una nueva cita (solo una por número de teléfono).')
  await sendText(socket, from!, 'Cancelar citas.')
  await sendText(socket, from!, 'Consultar los servicios que ofrece el consultorio dental.')
  await sendText(socket, from!, 'Preguntar sobre tratamientos o pequeñas consultas dentales.')
  await sendText(socket, from!, 'Preguntar por la dirección de la clínica dental.')
}