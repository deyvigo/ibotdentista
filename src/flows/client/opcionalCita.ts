import { proto, WASocket } from '@whiskeysockets/baileys'
import { Session } from '@interfaces/session.interface'
import { sendText } from '@services/bot/sendText'

export const opcionalCita = async (socket: WASocket, messageInfo: proto.IWebMessageInfo, session: Session) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation || ''

  switch (session.step) {
    case 0:
      await sendText(socket, from!, '¿Quieres reprogramar tu cita?')
      session.step += 1
      break
    case 1:
      break
  }
}