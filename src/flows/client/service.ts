import { proto, WASocket } from '@whiskeysockets/baileys'
import { ServiceRepository } from '@repositories/service'
import { sendText } from '@services/bot/sendText'
import { sendImage } from '@services/bot/sendImage'
import { createServicesCard } from '@services/images/createServicesCard'

export const services = async (socket: WASocket, messageInfo: proto.IWebMessageInfo) => {
  const from = messageInfo.key.remoteJid as string
  const services = await ServiceRepository.getServices()

  if (services.length === 0) {
    await sendText(socket, from!, 'No hay servicios disponibles aún.')
    return
  }

  // TODO
  // const imgBuffer = createServicesCard(services)

  await sendText(socket, from!, 'Estos son los servicios que ofrece el consultorio dental Tapia y Asociados:')
  let message = ''
  for (const service of services) {
    message += `*${service.name}:* ${service.description}\n`
  }
  await sendText(socket, from!, message)
}