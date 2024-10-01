import { WASocket } from '@whiskeysockets/baileys'
import { Session } from '../../interfaces/session.interface'
import { askToAI } from '../../services/ai'
import { sendText } from '../../services/bot/sendText'

export const doctorServiceValidator = async (
  socket: WASocket, message: string, from: string, session: Session, validateCondition: string
) => {
  const instructions = `
  Estás preguntando datos al cliente para crear un servicio.
  Ahora le estás pidiendo ${validateCondition}.
  Si el mensaje del cliente está correcto según el tipo de dato que has pedido, responde con la acción aceptar.
  Caso contrario, responde con la acción salir.
  Responde solo la acción. No incluyas ningún otro texto.
  Recuerda que el doctor no trabaja los domingos.
  `

  const option = (await askToAI(message, instructions) as string).toLocaleLowerCase().trim() 

  if (option === 'salir') {
    console.log('Saliendo del flujo del doctor...')
    session.flow = ''
    session.step = 0
    sendText(socket, from!, 'Lo siento. No puedo crear el servicio porque has ingresado un dato incorrecto.')
    return false
  }

  return true
}
