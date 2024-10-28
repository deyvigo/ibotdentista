import { WASocket } from '@whiskeysockets/baileys'
import { Session } from '@interfaces/session.interface'
import { askToAI } from '@services/ai'
import { sendText } from '@services/bot/sendText'
import { Validate } from './validator.interface'

export const doctorServiceValidator = async (
  socket: WASocket, message: string, from: string, session: Session, validateCondition: string
) => {
  const instructions = `
  Estás preguntando datos al cliente para crear un servicio.
  Ahora le estás pidiendo ${validateCondition}.
  Si el mensaje del cliente está correcto según el tipo de dato que has pedido, responde con la acción aceptar.
  Caso contrario, responde con la acción salir.
  Debes responde un JSON con la siguiente estructura:
  {
    "action": "aceptar" | "salir",
    "justification": "justifica al usuario la acción que estás respondiendo"
  }
  `

  const option = (await askToAI(message, 'json_object', instructions) as string)
  const resJson = JSON.parse(option) as Validate

  if (resJson.action.toLocaleLowerCase() === 'salir') {
    session.flow = ''
    session.step = 0
    session.payload = {}
    await sendText(socket, from!, resJson.justification)
    return false
  }

  return true
}

/**
* @description This function return false if the type of data is not valid
* @param {string} validateCondition type of data
*/
export const doctorTakeDayFreeValidator = async (
  socket: WASocket, message: string, from: string, session: Session, validateCondition: string
) => {
  const instructions = `
  Estás solicitando los datos necesarios al doctor para que se tome el día libre.
  No hay un tiempo mínimo de anticipación para este servicio.
  No sean tan estricto con los datos que pidas, con que se entienda a qué se refiere está bien.
  Ahora le estás pidiendo ${validateCondition}.
  Si el mensaje del doctor está correcto según el tipo de dato que has pedido, responde con la acción aceptar.
  Caso contrario, responde con la acción salir.
  Debes responder un JSON con la siguiente estructura:
  {
    "action": "aceptar" | "salir",
    "justification": "justifica al usuario la acción que estás respondiendo"
  }
  `

  const response = (await askToAI(message, 'json_object', instructions) as string)
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
