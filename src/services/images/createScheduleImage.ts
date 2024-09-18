import { createCanvas } from 'canvas'
import { ScheduleDTO } from './../../interfaces/schedule.interface'

export const createScheduleImage = (schedule: ScheduleDTO[]) => {
  const mainWidth = 880
  const mainHeight = 680

  const padding = 40

  const width = 800
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
  const columns = 7 // Lunes a Sábado

  const cellWidth = width / columns
  const cellHeight = height / rows

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  context.fillStyle = headerColor;
  context.font = headerFont;
  for (let i = 0; i < days.length; i++) {
    context.fillRect((i + 1) * cellWidth + padding, 0 + padding, cellWidth, cellHeight);
    context.fillStyle = textColor;

    // Calcular la posición del texto centrado
    const textWidth = context.measureText(days[i]).width;
    const x = (i + 1) * cellWidth + (cellWidth - textWidth) / 2 + padding;
    const y = cellHeight / 2 + 6 + padding; // 6 para ajustar un poco el centrado vertical

    context.fillText(days[i], x, y);
    context.fillStyle = headerColor;
  }


  // Dibujar las líneas
  context.strokeStyle = gridColor
  context.lineWidth = 1

  // Horizontal
  for (let i = 0; i <= rows; i++) {
    context.beginPath()
    context.moveTo(cellWidth + padding, i * cellHeight + padding) // para dejar en blanco las horas
    context.lineTo(width + padding, i * cellHeight + padding)
    context.stroke()
  }

  // Vertical
  for (let i = 1; i <= columns; i++) {
    context.beginPath()
    context.moveTo(i * cellWidth + padding, 0 + padding)
    context.lineTo(i * cellWidth + padding, height + padding)
    context.stroke()
  }

  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00']
  context.fillStyle = textColor
  context.font = font
  for (let i = 1; i <= hours.length; i++) {
    context.fillText(hours[i - 1], (cellWidth - 50) + padding, ((i) * cellHeight + 5) + padding)
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

  // Dibujar el horario
  context.font = font
  context.fillStyle = '#ADD8E6' // Color para los rectángulos
  schedule.forEach(c => {
    const dayIndex = dayToIndex[c.day as keyof typeof dayToIndex]
    const initIndex = hoursToIndex[c.start as keyof typeof hoursToIndex]
    const endIndex = hoursToIndex[c.end as keyof typeof hoursToIndex]
    const x = (dayIndex + 1) * cellWidth + 10
    const y = (initIndex + 1) * cellHeight + 10
    const width = cellWidth - 20
    const height = (endIndex - initIndex) * cellHeight - 20
    context.fillRect(x + padding, y + padding, width, height)
    context.fillStyle = '#ADD8E6' // Color para los rectángulos
  })



  // Guardar la imagen
  const buffer = canvas.toBuffer('image/png')
  return buffer
  // fs.writeFileSync('mainhorario.png', buffer)

  // console.log('Horario creado exitosamente.')
}
