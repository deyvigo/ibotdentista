import { WASocket, proto } from '@whiskeysockets/baileys'
import { askToAI } from '@services/ai'
import { sendText } from '@services/bot/sendText'

export const consultation = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation || ''

  const instructions = `
  Responde a la pregunta del dentista.
  Tu respuesta debe ser corta y concisa.
  No puedes mandar una respuesta vacía.
  `

  const aiResponse = await askToAI(messageText, 'text', instructions) as string

  await sendText(socket, from!, aiResponse)
}
