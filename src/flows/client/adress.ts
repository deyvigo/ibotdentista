import { proto, WASocket } from '@whiskeysockets/baileys'
import { sendText } from '../../services/bot/sendText'

export const adress = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string

  await sendText(socket, from!, 'Claro, esta es la dirección de la clínica: ')
  await sendText(socket, from!, 'https://maps.app.goo.gl/Z8YNugE5Hc8cHnUV7')
}