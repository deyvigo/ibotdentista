import { proto, WASocket } from "@whiskeysockets/baileys"
import { Session } from "../../interfaces/session.interface"
import { askToAI } from "../../services/ai"

export const doctorResponseValidator = async (sock: WASocket, session: Session, messageInfo: proto.IWebMessageInfo, dataType: string) => {
  const from = messageInfo.key.remoteJid as string
  const messageClient = messageInfo.message?.conversation || ''
  const promptClient = `
  Eres un bot de apoyo para un dentista y estás solicitando datos al usuario.
  Si el mensaje del usuario ${dataType}, responde con la acción salir.
  Caso contrario, responde con la acción aceptar.
  Este es el mensaje del usuario: ${messageClient}
  Respuesta ideal: (salir|aceptar)
  `

  const option = await askToAI(promptClient) as string

  if (option.toLocaleLowerCase() === 'salir') {
    console.log('Saliendo del flujo')
    session.flow = ''
    session.step = 0
    sock.sendMessage(from!, { text: 'Lo siento, no puedo cancelar la cita porque has ingresado un dato incorrecto.' })
    return true
  }

  return false
}
