import { WASocket, proto } from '@whiskeysockets/baileys'
import { askToAI } from '../../services/ai'
import { sendText } from '../../services/bot/sendText'

export const welcomeDoctor = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation || ''

  const prompt = `
  Eres un asistente chatbot de un dentista.
  Solo tienes dos respuestas posibles:
  - saludo: si el mensaje del dentista es un saludo
  - gracias: si el mensaje del usuario es un agradecimiento.
  - disculpas: si el mensaje del dentista es cualquier otra cosa
  Este es el mensaje del dentista: ${messageText}
  Debes responder solo la acción que el dentista quiere realizar.
  `

  const aiResponse = await askToAI(prompt)

  if (aiResponse === 'saludo') {
    await sendText(socket, from!, '¡Hola! Soy tu asistente inteligente ¿En qué puedo ayudarte?')
    return
  }

  if (aiResponse === 'gracias') {
    await sendText(socket, from!, 'De nada. Estoy aquí para ayudarte.')
    return
  }

  await sendText(socket, from!, 'Disculpa, no puedo ayudarte con eso.')
}
