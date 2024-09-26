import { proto, WASocket } from '@whiskeysockets/baileys'
import { sendText } from '../../services/bot/sendText'

export const informationClientBot = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string

  await sendText(socket, from!, 'Hola, soy Leopoldo, un asistente chatbot de la Clínica Dental Tapia y Asociados. Puedes consultar las siguientes acciones:')
  await sendText(socket, from!, '- Puedes consultar el horario de trabajo del doctor.')
  await sendText(socket, from!, '- Puedes ver las citas que tienes pendientes.')
  await sendText(socket, from!, '- Puedes agendar una nueva cita (solo una por número de teléfono).')
  await sendText(socket, from!, '- Puedes cancelar citas.')
  await sendText(socket, from!, '- Puedes consultar los servicios que ofrece el consultorio dental.')
  await sendText(socket, from!, '- Puedes preguntar sobre tratamientos o pequeñas consultas dentales.')
  await sendText(socket, from!, '- Puedes preguntar por la dirección de la clínica dental.')
}