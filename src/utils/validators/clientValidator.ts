import { WASocket } from '@whiskeysockets/baileys'
import { Session } from '../../interfaces/session.interface'
import { askToAI } from '../../services/ai'
import { sendText } from '../../services/bot/sendText'
import { Validate } from './validator.interface'

export const clientAskAppValidator = async (
  socket: WASocket, message: string, from: string, session: Session, validateCondition: string
) => {
  const instructions = `
  Estás creando una nueva cita para el cliente.
  Ahora le estás pidiendo ${validateCondition}.
  Si el mensaje del cliente está correcto según el tipo de dato que has pedido, responde con la acción aceptar.
  Caso contrario, responde con la acción salir.
  No debes ser tan estricto con los datos que pidas, con que se entienda a qué se refiere está bien.
  Debes responder un JSON con la siguiente estructura:
  {
    "action": "aceptar" | "salir",
    "justification": "justifica al usuario la acción que estás respondiendo"
  }
  `

  const response = await askToAI(message, 'json_object', instructions) as string
  const resJson = JSON.parse(response) as Validate

  if (resJson.action.toLocaleLowerCase() === 'salir') {
    console.log('Saliendo del flujo de cliente...')
    session.flow = ''
    session.step = 0
    session.payload = {}
    await sendText(socket, from!, resJson.justification)
    return false
  }

  return true
}