import { WASocket } from '@whiskeysockets/baileys'
import { Session } from '../../interfaces/session.interface'
import { askToAI } from '../../services/ai'
import { sendText } from '../../services/bot/sendText'
import { formatDate } from '../formatDate'

export const clientAskAppValidator = async (
  socket: WASocket, message: string, from: string, session: Session, validateCondition: string
) => {
  const instructions = `
  Siendo hoy ${formatDate(new Date())}.
  Estás preguntando datos al cliente para crear un cita.
  Ahora le estás pidiendo ${validateCondition}.
  Si el mensaje del cliente está correcto según el tipo de dato que has pedido, responde con la acción aceptar.
  Caso contrario, responde con la acción salir.
  Responde solo la acción. No incluyas ningún otro texto.
  El único día que el doctor no trabaja es el domingo.
  `

  const option = (await askToAI(message, instructions) as string).toLocaleLowerCase().trim() 

  if (option === 'salir') {
    console.log('Saliendo del flujo de cliente...')
    session.flow = ''
    session.step = 0
    await sendText(socket, from!, 'Lo siento. No puedo crear la cita porque has ingresado un dato incorrecto.')
    return false
  }

  return true
}