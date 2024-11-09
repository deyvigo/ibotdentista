import { createCanvas, loadImage } from 'canvas'

export const createScheduleImage = async (data: { day: string, hour: string }[]) => {
  const canvas = createCanvas(3000, 1400)
  const ctx = canvas.getContext('2d')

  const imgBackground = await loadImage('./src/services/images/mocks/horario-doctor.png')
  ctx.drawImage(imgBackground, 0, 0, canvas.width, canvas.height)

  const daysWidth = {
    'lunes': 557,
    'martes': 986,
    'miercoles': 1417,
    'jueves': 1847,
    'viernes': 2279,
    'sábado': 2712
  }

  const daysHeight = {
    '08:00:00': 409,
    '09:00:00': 513,
    '10:00:00': 617,
    '11:00:00': 721,
    '12:00:00': 824,
    '14:00:00': 928,
    '15:00:00': 1032,
    '16:00:00': 1136,
    '17:00:00': 1239
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
}
