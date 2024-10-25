import { WASocket } from '@whiskeysockets/baileys'
import { Session } from '../../interfaces/session.interface'
import { askToAI } from '../../services/ai'
import { sendText } from '../../services/bot/sendText'

export const serviceDoctorValidator = async (
  socket: WASocket, from: string, session: Session, message: string, validateCondition: string
) => {
  const prompt = `
  Eres un asistente chatbot de un dentista.
  Estas creando un nuevo servicio.
  Si el mensaje del usuario ${validateCondition}, responde con la acción salir.
  Caso contrario, responde con la acción aceptar.
  Mesaje del usuario: ${message}
  Respuesta ideal: (salir|aceptar)
  `

  const option = await askToAI(prompt, 'text') as string

  if (option === 'salir') {
    console.log('Saliendo del flujo de servicio...')
    session.flow = ''
    session.step = 0
    sendText(socket, from!, 'Lo siento. No puedo crear el servicio porque has ingresado un dato incorrecto.')
    return true
  }

  return false
}