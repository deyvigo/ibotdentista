import { createCanvas, loadImage } from 'canvas'
import { DateState } from '@utils/date'

export const createWeekScheduleImage = async (day: string, data: { day: string, hour: string, fullname: string, state: DateState }[]) => {
  const canvas = createCanvas(3000, 1400)
  const ctx = canvas.getContext('2d')

  const imgBackground = await loadImage('./src/services/images/mocks/plan-semana.png')
  ctx.drawImage(imgBackground, 0, 0, canvas.width, canvas.height)

  // set date string on top
  ctx.font = 'bold 30px "More Sugar"'
  ctx.fillStyle = '#000'
  const dayStringWidth = ctx.measureText(day).width
  ctx.fillText(day, 1633 - (dayStringWidth / 2) - 3, 202 + 8)

  const daysWidth = {
    'lunes': 557,
    'martes': 986,
    'miércoles': 1417,
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

  ctx.font = 'bold 28px "More Sugar"'

  data.forEach(({ day, hour, fullname, state }) => {
    if (state === 'occupied') {
      ctx.fillStyle = '#db383f'
      const textWidth = ctx.measureText('CON PERMISO').width
      ctx.fillText('CON PERMISO', daysWidth[day as keyof typeof daysWidth] - (textWidth) / 2 - 3, daysHeight[hour as keyof typeof daysHeight] + 8)
      return
    }
    ctx.fillStyle = state === 'attended' ? '#004aad' : '#000000'
    const textWidth = ctx.measureText(fullname).width
    ctx.fillText(fullname, daysWidth[day as keyof typeof daysWidth] - (textWidth / 2) - 3, daysHeight[hour as keyof typeof daysHeight] + 8)
  })

  const imgBuffer = canvas.toBuffer('image/png')
  return imgBuffer
}