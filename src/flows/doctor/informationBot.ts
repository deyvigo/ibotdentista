import { proto, WASocket } from '@whiskeysockets/baileys'
import { sendText } from '../../services/bot/sendText'

export const informationDoctorBot = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string

  await sendText(socket, from!, 'Las acciones con las que te puedo ayudar son:')
  await sendText(socket, from!, 'Consultar tu horario de trabajo.') 
  await sendText(socket, from!, 'Ver las citas que tienes que atender por día.')
  await sendText(socket, from!, 'Pedir libre un intervalo de tiempo (para cuando no podrás atender las citas durante un intervalo de tiempo).')
  await sendText(socket, from!, 'Puedes crear un nuevo servicio.')
  await sendText(socket, from!, 'Puedes preguntar sobre tratamientos o pequeñas consultas dentales.')
}