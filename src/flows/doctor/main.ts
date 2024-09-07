import { proto, WASocket } from '@whiskeysockets/baileys'
import { Session, DoctorFlow } from '../../interfaces/session.interface'
import { askToAI } from '../../services/ai'

const userSessions = new Map<string, Session>()

export const mainFlowDoctor = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation?.toLocaleLowerCase() || ''

  const prompt = `
  Eres un asistente chatbot de un dentista.
  Tus respuestas son cortas y concisas.
  Tienes una lista de acciones disponibles para el dentista:
  - saludo: para saludar al usuario
  - horario: para solicitar el horario de trabajo del doctor
  - citas: para ver las citas que tiene que atender el dentista
  - cancelar: para cancelar citas
  - servicios: para agregar un nuevo servicio
  - consultas: para realizar consultas sobre odontología
  Este es el mensaje del dentista: ${messageText}
  Debes responder solo la accion que el dentista quiere realizar.
  Si el mensaje del dentista es un saludo, responde con la accion saludo.
  Si el mensaje del dentista no tiene relación con el servicio dental, responde con la accion saludo.
  La accion saludo es la de menor prioridad.
  Respuesta ideal: (saludo|horario|citas|cancelar|consultas)
  `

  // obtain user session
  let session = userSessions.get(from) || { step: 0, flow: '', payload: {} }

  if (session.flow !== 'cancelar' && session.flow !== 'servicios') {
    session.flow = (await askToAI(prompt) as string).trim() as DoctorFlow
  }

  switch (session.flow) {
    case 'saludo':
      break
    case 'horario':
      break
    case 'citas':
      break
    case 'cancelar':
      break
    case 'servicios':
      break
    case 'consultas':
      break
  }

  // save updated session
  userSessions.set(from, session)
}
