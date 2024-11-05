import { AppointmentRepository } from "@repositories/appointment"
import { askToAI } from "@services/ai"
import { createImageDisponibility } from "@services/images/disponibility"

export const takeDayAndCreateImageDisponibility = async (day: string, idDoctor: string) => {
  const prompt = `
  Tu tarea principal es convertir el mensaja del cliente en una fecha
  Debes devolver un objeto JSON con la siguiente estructura:
  {
    "date": "Fecha en formato YYYY-MM-DD. No puede ser un día pasado. Llévalo al día más cercano en el futuro."
  }
  `
  const reponse = await askToAI(day, 'json_object', prompt)
  const jsonData = JSON.parse(reponse!) as { date: string }
  console.log('jsonData: ', jsonData)

  const data = await AppointmentRepository.getDisponibilityByDay(jsonData.date, idDoctor)

  const imageBuffer = await createImageDisponibility(data, jsonData.date)
  return imageBuffer
}