import { WASocket } from '@whiskeysockets/baileys'

export const sendImage = async (socket: WASocket, from: string, image: Buffer) => {
  await socket.sendMessage(from, { image: image })
}
