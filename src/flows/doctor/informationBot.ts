import { proto, WASocket } from '@whiskeysockets/baileys'
import { sendText } from '../../services/bot/sendText'

export const informationClientBot = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string

  await sendText(socket, from!, 'Hola, soy un asistente chatbot de un dentista. Puedes consultar las siguientes acciones:')
  await sendText(socket, from!, '- Puedes consultar tu horario de trabajo.')
  await sendText(socket, from!, '- Puedes ver las citas que tienes que atender por día.')
  await sendText(socket, from!, '- Puedes cancelar citas.')
  await sendText(socket, from!, '- Pedir libre un intervalo de tiempo')
  await sendText(socket, from!, '- Puedes preguntar sobre tratamientos o pequeñas consultas dentales.')
  await sendText(socket, from!, '- Puedes crear un nuevo servicio.')
}