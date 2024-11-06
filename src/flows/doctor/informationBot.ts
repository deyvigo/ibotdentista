import { proto, WASocket } from '@whiskeysockets/baileys'
import { sendText } from '@services/bot/sendText'

export const informationDoctorBot = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string

  await sendText(socket, from!, 'Las acciones con las que te puedo ayudar son:')

  const response = `- Consultar tu horario de trabajo.\n- Ver las citas que tienes que atender por día.\n- Pedir libre un intervalo de tiempo (para cuando no podrás atender las citas durante un intervalo de tiempo).\n- Puedes crear un nuevo servicio.\n- Puedes preguntar sobre tratamientos o pequeñas consultas dentales.\n- Preguntar por la dirección de la clínica dental.\n- Enviar un mensaje de difusión a todos los usuarios\n`

  await sendText(socket, from!, response)
}