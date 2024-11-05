import { Session } from "@/interfaces/session.interface";
import { ScheduleRepository } from "@/repositories/schedule";
import { askToAI } from "@/services/ai";
import { sendText } from "@/services/bot/sendText";
import { WASocket } from "@whiskeysockets/baileys";

export const isWorkingDay = async (
  socket: WASocket, session: Session, from: string, messageText: string 
) => {
  const instructions = `
  Tu tarea principal es conventir el mensaje del cliente en una fecha.
  Debes devolver un objeto JSON con la siguiente estructura:
  {
    "date": "Fecha en formato (lunes, martes, miercoles, jueves, viernes, sabado, domingo). Puede ser hoy, mañana, pero no un día pasado. Sin tildes. Solo fechas futuras."
  }
  `
  const response = await askToAI(messageText, 'json_object', instructions) as string
  const jsonData = JSON.parse(response) as { date: string }

  const rows = await ScheduleRepository.getByDay(jsonData.date.toLocaleLowerCase())
  if (rows.length === 0) {
    await sendText(socket, from!, 'Lo sentimos, el doctor no tiene horarios de trabajo para ese día.')
    session.flow = ''
    session.step = 0
    session.payload = {}
    return false
  }
  return true
}