import { NumberRepository } from '@/repositories/number'
import { askToAI } from '@/services/ai'
import { sendText } from '@/services/bot/sendText'
import { Session } from '@interfaces/session.interface'
import { proto, WASocket } from '@whiskeysockets/baileys'

export const sendDiffusionMessage = async (socket: WASocket, messageInfo: proto.IWebMessageInfo, session: Session) => {
  const messageText = messageInfo.message?.conversation || ''

  switch (session.step) {
    case 0:
      await sendText(socket, messageInfo.key.remoteJid!, '¿Cuál es el mensaje que quieres enviar?')
      session.step += 1
      break
    case 1:
      const instructions = `
      Aumenta Buenos días, Buenas noches, o Buenas tardes al mensaje del doctor según la hora del día.
      La hora es: ${new Date().toLocaleTimeString()}
      El formate que debes responder debería ser el siguiente: 'Saludo, y el mensaje del doctor'.
      No modificar el mensaje del doctor.
      `
      const response = await askToAI(messageText, 'text', instructions) as string

      const numbers = await NumberRepository.getAllNumbers()
      numbers.forEach(({ phone }) => {
        const jId = `${phone}@s.whatsapp.net`
        sendText(socket, jId, response)
      })

      // resetear el flujo
      session.flow = ''
      session.step = 0
      session.payload = {}

      break
  }
}