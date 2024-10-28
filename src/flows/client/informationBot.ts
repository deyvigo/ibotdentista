import { proto, WASocket } from '@whiskeysockets/baileys'
import { sendText } from '@services/bot/sendText'

export const informationClientBot = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string

  await sendText(socket, from!, 'Las acciones con las que te puedo ayudar son:')

  const response = `- Consultar el horario de trabajo del doctor.\n- Ver las citas que tienes pendientes.\n- Agendar una nueva cit(solo una por número de DNI).\n- Cancelar citas.\n- Consultar los servicios que ofrece el consultorio dental.\n- Preguntar sobre tratamientos o pequeñas consultas dentales.\n- Preguntar por la ubicación de la clínica dental.
  `
  
  await sendText(socket, from!, response)
}