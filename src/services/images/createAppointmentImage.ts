import { createCanvas } from 'canvas'
import { AppointmentClientDTO } from '@interfaces/appointment.interface'
import { formatDate } from '@utils/formatDate'

export const createAppointmentImage = (appointment: AppointmentClientDTO) => {
  const width = 700
  const height = 200
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, width, height)

  // Borde
  ctx.strokeStyle = '#2ABF64' // Verde oscuro
  ctx.lineWidth = 2
  ctx.roundRect(10, 10, width - 20, height - 20, 20)
  ctx.stroke()

  // Texto Hora
  ctx.fillStyle = '#2ABF64'
  ctx.font = 'bold 40px "Pompiere"'

  const hour = `${appointment.hour.split(':')[0]}:00`

  // Cálculo para centrar la hora
  const hourTextWidth = ctx.measureText(hour).width
  const hourXPosition = (180 - hourTextWidth) / 2 // Centrado dentro de los 200px hasta la línea vertical
  ctx.fillText(hour, hourXPosition, 110)

  // Línea vertical
  ctx.strokeStyle = '#2ABF64'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(180, 20)
  ctx.lineTo(180, height - 20)
  ctx.stroke()


  ctx.fillStyle = '#2ABF64'
  ctx.font = 'bold 20px "Pompiere"'
  ctx.fillText('Día', 210, 48)
  ctx.fillText('Doctor', 210, 88)
  ctx.fillText('Paciente', 210, 128)
  ctx.fillText('DNI', 210, 168)

  const day = formatDate(new Date(appointment.day))

  ctx.font = '20px "Pompiere"'
  ctx.fillText(day, 300, 48)
  ctx.fillText(appointment.doctor_name, 300, 88)
  ctx.fillText(appointment.fullname, 300, 128)
  ctx.fillText(appointment.dni, 300, 168)

  const buffer = canvas.toBuffer('image/png')
  return buffer

}