import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import { createDatabase } from './services/connection'
import 'dotenv/config'
import { mainFlow } from './flows/main'
import { AppointmentRepository } from './repositories/appointment'
import { programNotify } from './services/schedule/programNotify'
import { programChangeStatusAppointment } from './services/schedule/programChangeStatus'

const connectToWhatsApp = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
  const socket = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  })

  socket.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update || {}

    if (qr) {
      console.log(qr)
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect)

      if (shouldReconnect) {
        connectToWhatsApp()
      }
    }
  })

  socket.ev.on('creds.update', saveCreds)

  socket.ev.on('messages.upsert', async (messageUpdate) => {
    // Si los mensajes son reacciones
    if (messageUpdate.messages[0].message?.reactionMessage) {
      return
    }
    // console.log(messageUpdate.messages[0])
    const message = messageUpdate.messages[0]

    // Verificar si el mensaje es del propio bot
    if (message.key.fromMe) return

    mainFlow(socket, message)
  })

  // program notify and change status for appointments in database
  const appointments = await AppointmentRepository.getPendingAppointments()
  for (const appointment of appointments) {
    programNotify(socket, appointment, -30)
    programChangeStatusAppointment(appointment, 'attended')
  }
}

const initializeApp = async () => {
  await createDatabase()
  await connectToWhatsApp()
}

initializeApp()
