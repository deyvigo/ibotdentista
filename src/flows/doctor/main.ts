import { proto, WASocket } from '@whiskeysockets/baileys'
import { Session, DoctorFlow } from '../../interfaces/session.interface'
import { askToAI } from '../../services/ai'
import { welcomeDoctor } from './welcome'
import { consultation } from './consultations'
import { scheduleDoctor } from './schedule'
import { addService } from './addService'
import { viewDaySchedule } from './viewDaySchedule'
import { cancelAppointments } from './cancelAppointments'

const userSessions = new Map<string, Session>()

export const mainFlowDoctor = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation?.toLocaleLowerCase() || ''

  const prompt = `
  Eres un asistente chatbot de un dentista.
  Tus respuestas son cortas y concisas.
  Tienes una lista de acciones disponibles para el dentista:
  - informacion-bot: para preguntar sobre que hace el bot
  - bienvenida: para saludar al usuario o recibir agradecimientos
  - horario: para solicitar el horario de trabajo del doctor
  - ver-citas: para ver las citas que tiene que atender el dentista
  - cancelar: para cancelar citas o tomarse tiempo del día libre
  - crear-servicio: para agregar un nuevo servicio
  - consultas: para realizar consultas sobre odontología
  Este es el mensaje del dentista: ${messageText}
  Debes responder solo la accion que el dentista quiere realizar.
  Si el mensaje del dentista es un saludo, responde con la accion bienvenida.
  Si el mensaje del dentista no tiene relación con el servicio dental, responde con la accion bienvenida.
  La accion bienvenida es la de menor prioridad.
  Respuesta ideal: (informacion-bot|bienvenida|horario|citas|cancelar|crear-servicio|consultas)
  `

  // obtain user session
  let session = userSessions.get(from) || { step: 0, flow: '', payload: {} }

  if (session.flow !== 'cancelar' && session.flow !== 'crear-servicio') {
    session.flow = (await askToAI(prompt) as string).trim() as DoctorFlow
  }

  console.log('user: ', from, 'session: ', session)

  switch (session.flow) {
    case 'informacion-bot':
      break
    case 'bienvenida':
      await welcomeDoctor(socket, messageInfo)
      break
    case 'horario':
      scheduleDoctor(socket, messageInfo)
      break
    case 'ver-citas':
      viewDaySchedule(socket, messageInfo)
      break
    case 'cancelar':
      cancelAppointments(socket, messageInfo, session)
      break
    case 'crear-servicio':
      addService(socket, messageInfo, session)
      break
    case 'consultas':
      await consultation(socket, messageInfo)
      break
  }

  // save updated session
  userSessions.set(from, session)
}
