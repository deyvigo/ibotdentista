import { proto, WASocket } from '@whiskeysockets/baileys'
import { Session, DoctorFlow } from '@interfaces/session.interface'
import { askToAI } from '@services/ai'
import { welcomeDoctor } from './welcome'
import { consultation } from './consultations'
import { scheduleDoctor } from './schedule'
import { addService } from './addService'
import { viewWeekSchedule } from './viewWeekSchedule'
import { cancelAppointments } from './cancelAppointments'
import { informationDoctorBot } from './informationBot'
import { sendDiffusionMessage } from './sendDiffusionMessage'

const userSessions = new Map<string, Session>()

export const mainFlowDoctor = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation?.toLocaleLowerCase() || ''

  const instructions = `
  Tienes una lista de acciones disponibles para el dentista:
  - informacion-bot: para preguntar sobre que hace el bot
  - bienvenida: para saludar al usuario o recibir agradecimientos
  - horario: para solicitar el horario de trabajo del doctor
  - ver-citas: para ver las citas que tiene que atender el dentista por semana
  - cancelar: para cancelar citas o tomarse tiempo del día libre
  - crear-servicio: para agregar un nuevo servicio
  - consultas: para realizar consultas sobre odontología
  - difusion: para enviar un mensaje, alerta, promoción, etc a todos los usuarios
  Si el mensaje del dentista es un saludo, responde con la accion bienvenida.
  Si el mensaje del dentista no tiene relación con el servicio dental, responde con la accion bienvenida.
  La accion bienvenida es la de menor prioridad.
  Respuesta ideal: (informacion-bot|bienvenida|horario|citas|cancelar|crear-servicio|consultas). Solo la acción sin parentesis ni espacios.
  `

  // obtain user session
  let session = userSessions.get(from) || { step: 0, flow: '', payload: {} }

  if (session.flow !== 'cancelar' && session.flow !== 'crear-servicio' && session.flow !== 'difusion') {
    session.flow = (await askToAI(messageText, 'text', instructions) as string).trim() as DoctorFlow
  }

  console.log('user: ', from, 'session: ', session)

  switch (session.flow) {
    case 'informacion-bot':
      informationDoctorBot(socket, messageInfo)
      break
    case 'bienvenida':
      welcomeDoctor(socket, messageInfo)
      break
    case 'horario':
      scheduleDoctor(socket, messageInfo)
      break
    case 'ver-citas':
      viewWeekSchedule(socket, messageInfo)
      break
    case 'cancelar':
      cancelAppointments(socket, messageInfo, session)
      break
    case 'crear-servicio':
      addService(socket, messageInfo, session)
      break
    case 'consultas':
      consultation(socket, messageInfo)
      break
    case 'difusion':
      sendDiffusionMessage(socket, messageInfo, session)
  }

  // save updated session
  userSessions.set(from, session)
}
