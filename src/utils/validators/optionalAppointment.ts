import { askToAI } from '@/services/ai'
import { Session } from '@interfaces/session.interface'
import { WASocket } from '@whiskeysockets/baileys'
import { Validate } from './validator.interface'
import { sendText } from '@/services/bot/sendText'


/**
* @description This function return false if the type of data is not valid
*/
export const optionalAppointmentValidator = async (
  socket: WASocket, message: string, from: string, session: Session, validateCondition: string
) => {
  const instructions = `
  Estás solicitando datos al cliente para reprogramar una cita.
  Ahora le estás pidiendo ${validateCondition}.
  Si el mensaje del cliente está correcto según el tipo de dato que has pedido, responde con la acción aceptar.
  Caso contrario, responde con la acción salir.
  Debes responder un JSON con la siguiente estructura:
  {
    "action": "aceptar" | "salir",
    "justification": "justifica al usuario la acción que estás respondiendo"
  }
  `

  const response = await askToAI(message, 'json_object', instructions) as string
  const resJson = JSON.parse(response) as Validate

  if (resJson.action.toLocaleLowerCase() === 'salir') {
    session.flow = ''
    session.step = 0
    session.payload = {}
    await sendText(socket, from!, resJson.justification)
    return false
  }

  return true
}