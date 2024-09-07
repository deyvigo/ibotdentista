import { WASocket, proto } from '@whiskeysockets/baileys'
import { Session, ClientFlow } from '../../interfaces/session.interface'
import { askToAI } from '../../services/ai'

const userSession = new Map<string, Session>()

export const mainFlowClient = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation?.toLocaleLowerCase() || ''

  const prompt = `
  Eres un asistente chatbot de un dentista.
  Tus respuestas son cortas y concisas.
  Tienes una lista de acciones disponibles para el usuario:
  - saludo: para saludar al usuario
  - servicios: para listar los servicios disponibles por el consultorio dentista
  - horario-doctor: para solicitar el horario de trabajo de un doctor
  - consultas: para realizar consultas sobre odontología
  - solicitar-cita: para solicitar una cita con un doctor
  - cancelar-cita: para cancelar una cita con un doctor
  - citas-creadas: para ver las citas que el usuario ha realizado
  Este es el mensaje del usuario: ${messageText}
  Debes responder solo la accion que el usuario quiere realizar.
  Si el mensaje del usuario es un saludo, responde con la accion saludo.
  Si el mensaje del usuario no tiene relación con el servicio dental, responde con la accion saludo.
  La accion saludo es la de menor prioridad.
  Respuesta ideal: (saludo|servicios|horario-doctor|consultas|solicitar-cita|cancelar-cita|citas-creadas)
  `

  // obtain user session
  let session = userSession.get(from) || { step: 0, flow: '', payload: {} }

  // Si el mensaje es solicitar-cita, no preguntar a la ia porque el flujo se rompe desde dentro
  if (session.flow !== 'solicitar-cita') {
    session.flow = (await askToAI(prompt) as string).trim() as ClientFlow
  }

  console.log('session.flow: ', session.flow)

  switch (session.flow) {
    case 'saludo':
      break
    case 'servicios':
      break
    case 'horario-doctor':
      break
    case 'consultas':
      break
    case 'solicitar-cita':
      break
    case 'cancelar-cita':
      break
    case 'citas-creadas':
      break
  }

  // save updated session
  userSession.set(from, session)
}
