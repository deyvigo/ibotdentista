import { proto, WASocket } from '@whiskeysockets/baileys'
import { askToAI } from '../../services/ai'
import { sendText } from '../../services/bot/sendText'

export const welcomeClient = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation || ''

  const prompt = `
  Eres un asistente de chatbot de un dentista.
  Solo tienes estas respuestas posibles:
  - saludo: si el mensaje del usuario es un saludo.
  - gracias: si el mensaje del usuario es un agradecimiento.
  - disculpas: si el mensaje del usuario es otra cosa.
  Este es el mensaje del usuario: ${messageText}
  Debes responder solo la accion que el usuario quiere realizar.
  `

  const aiResponse = (await askToAI(prompt) as string).toLocaleLowerCase().trim()

  if (aiResponse === 'saludo') {
    await sendText(socket, from!, 'Hola. Soy el asistente de la consultora dentista Sonrisa Colgate.')
    await sendText(socket, from!, '¿En qué puedo ayudarte?')
    return
  }

  if (aiResponse === 'gracias') {
    await sendText(socket, from!, 'De nada. Estoy aquí para ayudarte.')
    return
  }

  await sendText(socket, from!, 'Disculpa. No puedo ayudarte con eso.')
}