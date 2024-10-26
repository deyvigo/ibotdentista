import { WASocket, proto } from '@whiskeysockets/baileys'
import { DoctorRepository } from '@repositories/doctor'
import { mainFlowClient } from '@flows/client/main'
import { mainFlowDoctor } from '@flows/doctor/main'

export const mainFlow = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid
  const receiver = from?.split('@')[0]
  const rows = await DoctorRepository.getDoctors()

  const doctors = rows.map(row => row.phone)

  if (doctors.includes(receiver!)) {
    await mainFlowDoctor(socket, messageInfo)
    return
  }

  await mainFlowClient(socket, messageInfo)
}
