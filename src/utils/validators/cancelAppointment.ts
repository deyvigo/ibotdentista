import { askToAI } from '@/services/ai'
import { Session } from '@interfaces/session.interface'
import { WASocket } from '@whiskeysockets/baileys'

export const cancelAppointmentValidator = async (
  socket: WASocket, message: string, from: string, session: Session
) => {
  const instructions = `
  Estás pidiendo solo el dni del cliente. (un string de 8 dígitos).
  Si el mensaje del cliente está correcto según el tipo de dato que has pedido, responde con la acción aceptar.
  Caso contrario, responde con la acción salir.
  Respuesta ideal: "aceptar" | "salir".
  Sin comillas ni mayúsculas.
  `
  const response = await askToAI(message, 'text', instructions) as string

  if (response.toLocaleLowerCase() === 'salir') {
    console.log('Saliendo del flujo de cancelación de cita...')
    session.flow = ''
    session.step = 0
    session.payload = {}
    return false
  }

  return true
}