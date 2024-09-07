import { WASocket, proto } from '@whiskeysockets/baileys'
import { DoctorRepository } from '../repositories/doctor'
import { mainFlowClient } from './client/main'
import { mainFlowDoctor } from './doctor/main'

export const mainFlow = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid
  const receiver = from?.split('@')[0]
  const rows = await DoctorRepository.getDoctors()

  const doctors = rows.map(row => row.phone)

  if (doctors.includes(receiver!)) {
    mainFlowDoctor(socket, messageInfo)
    return
  }

  mainFlowClient(socket, messageInfo)
}
