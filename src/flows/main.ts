import { WASocket, proto } from '@whiskeysockets/baileys'
import { DoctorRepository } from '../repositories/doctor'

export const mainFlow = async (socket: WASocket, message: proto.IWebMessageInfo) => {
  const from = message.key.remoteJid
  const receiver = message.key.remoteJid?.split('@')[0]
  const rows = await DoctorRepository.getDoctors()

  const doctors = rows.map(row => row.phone)

  if (doctors.includes(receiver!)) {
    await socket.sendMessage(from!, { text: `Hola jefe ${receiver}` })
    return
  }

  await socket.sendMessage(from!, { text: `No eres doctor ${receiver}` })
}
