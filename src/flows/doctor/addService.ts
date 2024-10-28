import { proto, WASocket } from '@whiskeysockets/baileys'
import { Session, SessionDoctorService } from '@interfaces/session.interface'
import { sendText } from '@services/bot/sendText'
import { serviceDataCreateValidator } from '@utils/validators/service.validator'
import { askToAI } from '@services/ai'
import { DoctorRepository } from '@repositories/doctor'
import { ServiceRepository } from '@repositories/service'
import { CreateServiceDTO } from '@interfaces/service.interface'

export const addService = async (socket: WASocket, messageInfo: proto.IWebMessageInfo, session: Session) => {
  const from = messageInfo.key.remoteJid as string
  const messageText = messageInfo.message?.conversation || ''
  const clientNumber = from.split('@')[0] as string

  const clientPayload = session.payload as SessionDoctorService

  switch (session.step) {
    case 0:
      await sendText(socket, from!, 'Claro. Creemos un nuevo servicio.')
      await sendText(socket, from!, '¿Cuál es el nombre del servicio?')
      session.step += 1
      break
    case 1:
      if (
        !await serviceDataCreateValidator(socket, from!, session, messageText, 'un nombre para un servicio nuevo del consultorio')
      ) return

      clientPayload.name = messageText
      session.payload = clientPayload
      session.step += 1

      await sendText(socket, from!, '¿Cuál es la descripción del servicio?')
      break
    case 2:
      if (
        !await serviceDataCreateValidator(socket, from!, session, messageText, `una descripción del servicio ${clientPayload.name}`)
      ) return

      const prompt = `
      Tu tarea principal es crear un nuevo servicio.
      Información del cliente: ${JSON.stringify(clientPayload)}
      Deber generar un objeto JSON con la siguiente estructura:
      {
        "name": "Nombre del servicio.",
        "description": "Pequeña descripción del servicio."
      }
      A poder ser, mejora la descripción del servicio, pero sé muy breve.
      Responde solo con el objeto JSON. No incluyas ningún otro texto.
      Objeto JSON generado:
      `

      const data = await askToAI(prompt, 'json_object') as string
      const jsonData = JSON.parse(data) as CreateServiceDTO

      const doctor = await DoctorRepository.getDoctors()
      const idDoctor = doctor[0].id_doctor

      jsonData.id_doctor = idDoctor

      const result = await ServiceRepository.createService(jsonData)

      await sendText(socket, from!, result)

      // resetear el flujo
      session.flow = ''
      session.step = 0
      session.payload = {}
      break
  }
}
