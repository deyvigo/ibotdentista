import { createCanvas, loadImage } from 'canvas'

export const createScheduleImage = async (data: { day: string, hour: string }[]) => {
  const canvas = createCanvas(3000, 1400)
  const ctx = canvas.getContext('2d')

  const imgBackground = await loadImage('./src/services/images/mocks/horario-doctor.png')
  ctx.drawImage(imgBackground, 0, 0, canvas.width, canvas.height)

  const daysWidth = {
    'lunes': 564,
    'martes': 993,
    'miércoles': 1421,
    'jueves': 1854,
    'viernes': 2285,
    'sábado': 2717
  }

  const daysHeight = {
    '08:00:00': 339,
    '09:00:00': 443,
    '10:00:00': 547,
    '11:00:00': 650,
    '12:00:00': 754,
    '14:00:00': 858,
    '15:00:00': 962,
    '16:00:00': 1065,
    '17:00:00': 1169,
    '18:00:00': 1272
  }

  data.forEach(({ day, hour }) => {
    ctx.font = 'bold 24px "More Sugar"'
    ctx.fillStyle = '#008000'
    const textWidth = ctx.measureText('ATIENDE').width
    ctx.fillText('ATIENDE', daysWidth[day as keyof typeof daysWidth] - (textWidth / 2) - 3, daysHeight[hour as keyof typeof daysHeight] + 8)
  })

  // Guardar la imagen
  const buffer = canvas.toBuffer('image/png')
  return buffer
  // fs.writeFileSync('mainhorario.png', buffer)
}
