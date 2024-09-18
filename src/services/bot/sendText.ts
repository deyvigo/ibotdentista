import { WASocket } from '@whiskeysockets/baileys'

export const sendText = async (socket: WASocket, from: string, text: string) => {
  await socket.sendMessage(from, { text: text })
}
