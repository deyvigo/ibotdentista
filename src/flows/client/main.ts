import { WASocket, proto } from '@whiskeysockets/baileys'
import { Session, ClientFlow } from '../../interfaces/session.interface'
import { askToAI } from '../../services/ai'
import { welcomeClient } from './welcome'
import { services } from './service'
import { doctorSchedule } from './doctorSchedule'
import { consultations } from './consultations'
import { askAppointment } from './askAppointment'
import { consultAppointment } from './consultAppointment'
import { cancelAppointment } from './cancelAppointment'
import { informationClientBot } from './informationBot'
import { adress } from './adress'
import { modifyAppointment } from './modifyAppointment'

const userSession = new Map<string, Session>()

export const mainFlowClient = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation?.toLocaleLowerCase() || ''

  const instructions = `
  Tienes una lista de acciones disponibles para el usuario:
  - informacion-bot: para preguntar sobre que puede hacer el asistente
  - direccion: para preguntar la dirección de la clínica dentista
  - bienvenida: para saludar al usuario o recibir agradecimientos o para presentarte ante el usuario
  - servicios: para listar los servicios disponibles por el consultorio dentista
  - horario-doctor: para solicitar el horario de trabajo de un doctor
  - reprogramar-cita: para reprogramar una cita con un doctor
  - consultas: para realizar consultas sobre odontología
  - solicitar-cita: para solicitar una cita con un doctor
  - cancelar-cita: para cancelar una cita con un doctor
  - citas-creadas: para ver las citas que el usuario ha realizado
  Si el mensaje del usuario es un saludo, responde con la accion bienvenida.
  Si el mensaje del usuario no tiene relación con el servicio dental, responde con la accion bienvenida.
  La accion bienvenida es la de menor prioridad.
  Respuesta ideal: (informacion-bot|bienvenida|servicios|horario-doctor|reprogramar-cita|consultas|solicitar-cita|cancelar-cita|citas-creadas). Solo la acción sin parentesis ni espacios.
  `

  // obtain user session
  let session = userSession.get(from) || { step: 0, flow: '', payload: {} }

  // Si el mensaje es solicitar-cita, no preguntar a la ia porque el flujo se rompe desde dentro
  if (session.flow !== 'solicitar-cita' && session.flow !== 'reprogramar-cita' && session.flow !== 'opcional-cita') {
    session.flow = (await askToAI(messageText, 'text', instructions) as string).trim() as ClientFlow
  }

  console.log('user: ', from, 'session: ', session)

  switch (session.flow) {
    case 'direccion':
      adress(socket, messageInfo)
      break
    case 'informacion-bot':
      informationClientBot(socket, messageInfo)
      break
    case 'bienvenida':
      welcomeClient(socket, messageInfo)
      break
    case 'servicios':
      services(socket, messageInfo)
      break
    case 'horario-doctor':
      doctorSchedule(socket, messageInfo)
      break
    case 'reprogramar-cita':
      modifyAppointment(socket, messageInfo, session)
      break
    case 'consultas':
      consultations(socket, messageInfo)
      break
    case 'solicitar-cita':
      askAppointment(socket, messageInfo, session)
      break
    case 'cancelar-cita':
      cancelAppointment(socket, messageInfo)
      break
    case 'citas-creadas':
      consultAppointment(socket, messageInfo)
      break
    case 'opcional-cita':
      break
  }

  // save updated session
  userSession.set(from, session)
}
