import { proto, WASocket } from '@whiskeysockets/baileys'
import { askToAI } from '../../services/ai'
import { sendText } from '../../services/bot/sendText'

export const consultations = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation || ''

  const prompt = `
  Eres un asistente chatbot de un dentista.
  Responde a la pregunta del usuario.
  La pregunta es: ${messageText}
  Tu respuesta debe ser corta y concisa.
  No puedes mandar una respuesta vacía.
  `

  const aiResponse = await askToAI(prompt) as string

  await sendText(socket, from!, aiResponse)
}