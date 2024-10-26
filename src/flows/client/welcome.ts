import { proto, WASocket } from '@whiskeysockets/baileys'
import { askToAI } from '@services/ai'
import { sendText } from '@services/bot/sendText'

export const welcomeClient = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation || ''

  const instructions = `
  Solo puedes responder preguntas con temas a tu alcance, recuerda que eres un asistente de un dentista.
  Si el mensaje del usuario es un saludo, te presentas.
  Si el mensaje del usuario es una pregunta sobre ti, te presentas.
  Si el mensaje del usuario es un agradecimiento, responde adecuadamente.
  Caso contrario, respondes la pregunta sin saludar.
  `

  const aiResponse = (await askToAI(messageText, 'text', instructions) as string).trim()
  
  await sendText(socket, from!, aiResponse)
}