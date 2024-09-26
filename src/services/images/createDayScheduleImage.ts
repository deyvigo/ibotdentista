import { createCanvas } from 'canvas'
import { AppointmentDoctorDTO } from '../../interfaces/appointment.interface'

export const createDayScheduleImage = (day: string, daySchedule: AppointmentDoctorDTO[]) => {
  const mainWidth = 580
  const mainHeight = 680

  const padding = 40

  const width = 500
  const height = 600

  const backgroundColor = '#ffffff'
  const textColor = '#000000'
  const gridColor = '#000110'
  const headerColor = '#ffcc00'
  const font = 'bold 20px "Pompiere"'
  const headerFont = 'bold 20px "Pompiere"'

  const canvas = createCanvas(mainWidth, mainHeight)
  const context = canvas.getContext('2d')

  // Dibujar un rectángulo de fondo
  context.fillStyle = backgroundColor
  context.fillRect(0, 0, mainWidth, mainHeight)

  // Dibujar el espacio del horario
  context.fillStyle = backgroundColor
  context.fillRect(padding, padding, width, height)

  // Enmarcar el espacio del horario
  context.fillStyle = textColor
  context.strokeRect(padding - 20, padding - 20, width + 40, height + 40)

  const rows = 10 // Horas
  const columns = 2 // Lunes a Sábado

  const cellWidth = width / columns
  const cellHeight = height / rows

  context.fillStyle = headerColor
  context.font = headerFont
  context.fillRect(padding + 70, padding, 430, cellHeight)
  context.fillStyle = textColor

  const textWidth = context.measureText(day).width
  const x = padding + 70 + (430 - textWidth) / 2
  const y = cellHeight / 2 + 6 + padding; // 6 para ajustar un poco el centrado vertical
  context.fillText(day, x, y)
  context.fillStyle = headerColor
  

  // context.fillStyle = headerColor;
  // context.font = headerFont;
  // for (let i = 0; i < days.length; i++) {
  //   context.fillRect((i + 1) * 100 + padding, 0 + padding, cellWidth, cellHeight);
  //   context.fillStyle = textColor;

  //   // Calcular la posición del texto centrado
  //   const textWidth = context.measureText(days[i]).width;
  //   const x = (i + 1) * 300 + (300 - textWidth) / 2 + padding;
  //   const y = cellHeight / 2 + 6 + padding; // 6 para ajustar un poco el centrado vertical

  //   context.fillText(days[i], x, y);
  //   context.fillStyle = headerColor;
  // }


  // Dibujar las líneas
  context.strokeStyle = gridColor
  context.lineWidth = 1

  // Horizontal
  for (let i = 0; i <= rows; i++) {
    context.beginPath()
    context.moveTo(70 + padding, i * cellHeight + padding) // para dejar en blanco las horas
    context.lineTo(width + padding, i * cellHeight + padding)
    context.stroke()
  }

  // Vertical
  for (let i = 1; i <= columns; i++) {
    if (i === 1) {
      context.beginPath()
      context.moveTo(i * 70 + padding, 0 + padding)
      context.lineTo(i * 70 + padding, height + padding)
      context.stroke()
    } else {
      context.beginPath()
      context.moveTo(i * 250 + padding, 0 + padding)
      context.lineTo(i * 250 + padding, height + padding)
      context.stroke()
    }
  }

  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00']
  context.fillStyle = textColor
  context.font = font
  for (let i = 1; i <= hours.length; i++) {
    context.fillText(hours[i - 1], (70 - 50) + padding, ((i) * cellHeight + 5) + padding)
  }

  const hoursToIndex = {
    '08:00:00': 0,
    '09:00:00': 1,
    '10:00:00': 2,
    '11:00:00': 3,
    '12:00:00': 4,
    '14:00:00': 5,
    '15:00:00': 6,
    '16:00:00': 7,
    '17:00:00': 8,
    '18:00:00': 9
  }

  const dayToIndex = {
    'lunes': 0,
    'martes': 1,
    'miércoles': 2,
    'jueves': 3,
    'viernes': 4,
    'sábado': 5
  }

  // Dibujar las citas
  context.font = font
  context.fillStyle = '#000' // Color para los rectángulos
  daySchedule.forEach(d => {
    const initIndex = hoursToIndex[d.hour as keyof typeof hoursToIndex]
    let text = ''
    if (d.state === 'occupied') {
      text = 'No disponible'
    } else if (d.state === 'pending') {
      text = 'Paciente: ' + d.full_name + ' DNI: ' + d.dni
    }
    const textWidth = context.measureText(text).width
    const x = padding + 70 + (430 - textWidth) / 2
    const y = initIndex * 60 + padding + 100
    context.fillText(text, x, y)
  })



  // Guardar la imagen
  const buffer = canvas.toBuffer('image/png')
  
  return buffer
}