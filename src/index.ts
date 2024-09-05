import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'

import 'dotenv/config'

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
  
      // mainFlow(sock, message)
      
      const from = message.key.remoteJid
      const receiver = messageUpdate.messages[0].key.remoteJid?.split('@')[0]
  
      const doctors = []
  
      if (receiver === '51968415578') {
        if (!message.key.fromMe) {
          await socket.sendMessage(from!, { text: `Hola jefe ${receiver}` })
        }
        return
      }
  
      if (!message.key.fromMe) {
        await socket.sendMessage(from!, { text: `Hello ${receiver}` })
        await socket.sendMessage(from!, { text: `Hello 2 ${receiver}` })
      }
    })
  })
}

connectToWhatsApp()

