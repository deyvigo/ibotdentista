import { WASocket } from '@whiskeysockets/baileys'
import { Session } from '@interfaces/session.interface'
import { askToAI } from '@services/ai'
import { sendText } from '@services/bot/sendText'
import { Validate } from './validator.interface'

/**
 * @description This function return false if the type of data is not valid
 */
export const serviceDataCreateValidator = async (
  socket: WASocket, from: string, session: Session, message: string, validateCondition: string
) => {
  const instructions = `
  Está solicitando datos al doctor para crear un nuevo servicio.
  Ahora le estás pidiendo ${validateCondition}.
  Si el mensaje del doctor está correcto según el tipo de dato que has pedido, responde con la acción aceptar.
  Caso contrario, responde con la acción salir.
  Debes responder un JSON con la siguiente estructura:
  {
    "action": "aceptar" | "salir",
    "justification": "justifica al usuario la acción que estás respondiendo"
  }
  `

  console.log('Instructions: ', instructions)

  const response = await askToAI(message, 'text', instructions) as string
  const resJson = await JSON.parse(response) as Validate

  if (resJson.action.toLocaleLowerCase() === 'salir') {
    console.log('Saliendo del flujo de servicio...')
    session.flow = ''
    session.step = 0
    session.payload = {}
    await sendText(socket, from!, resJson.justification)
    return false
  }

  return true
}