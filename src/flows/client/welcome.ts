import { proto, WASocket } from '@whiskeysockets/baileys'
import { askToAI } from '../../services/ai'
import { sendText } from '../../services/bot/sendText'

export const welcomeClient = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation || ''

  const instructions = `
  Solo puedes responder preguntas con temas a tu alcance.
  Si el mensaje del usuario es un saludo, te presentas.
  Si el mensaje del usuario es una pregunta sobre ti, te presentas.
  Si el mensaje del usuario es un agradecimiento, responde adecuadamente.
  Caso contrario, respondes la pregunta sin saludar.
  `

  const aiResponse = (await askToAI(messageText, instructions) as string).trim()

  // if (aiResponse === 'saludo') {
  //   await sendText(socket, from!, 'Hola. Soy Leopoldo, el asistente de la Clínica Dental Tapia y Asociados.')
  //   await sendText(socket, from!, '¿En qué puedo ayudarte?')
  //   return
  // }

  // if (aiResponse === 'gracias') {
  //   await sendText(socket, from!, 'De nada. Estoy aquí para ayudarte.')
  //   return
  // }

  // await sendText(socket, from!, 'Disculpa. No puedo ayudarte con eso.')

  await sendText(socket, from!, aiResponse)
}