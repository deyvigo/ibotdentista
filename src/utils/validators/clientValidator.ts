import { WASocket } from "@whiskeysockets/baileys";
import { Session } from "../../interfaces/session.interface";
import { askToAI } from "../../services/ai";
import { sendText } from "../../services/bot/sendText";

export const clientResponseValidator = async (
  socket: WASocket, message: string, from: string, session: Session, validateCondition: string
) => {
  const prompt = `
  Eres un bot de apoyo para un dentista y estás creando una cita.
  Si el mensaje del cliente ${validateCondition}, response con la acción salir.
  Caso contrario, responde con la acción aceptar.
  Mesaje del cliente: ${message}
  Respuesta ideal: (salir|aceptar)
  `

  const option = await askToAI(prompt) as string

  if (option === 'salir') {
    console.log('Saliendo del flujo de cliente...')
    session.flow = ''
    session.step = 0
    await sendText(socket, from!, 'Lo siento. No puedo crear la cita porque has ingresado un dato incorrecto.')
    return true
  }

  return false
}