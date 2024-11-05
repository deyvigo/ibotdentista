import { createCanvas, loadImage } from 'canvas'
import { AppointmentDoctorDTO } from '@interfaces/appointment.interface'
import { DateState } from '@/utils/date'

export const createWeekScheduleImage = async (day: string, data: { day: string, hour: string, fullname: string, state: DateState }[]) => {
  const canvas = createCanvas(3000, 1400)
  const ctx = canvas.getContext('2d')

  const imgBackground = await loadImage('./src/services/images/mocks/planes-semana.png')
  ctx.drawImage(imgBackground, 0, 0, canvas.width, canvas.height)

  // set date string on top
  ctx.font = 'bold 28px "More Sugar"'
  ctx.fillStyle = '#000'
  const dayStringWidth = ctx.measureText(day).width
  ctx.fillText(day, 1639 - (dayStringWidth / 2) - 3, 131 + 8)

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

  data.forEach(({ day, hour, fullname, state }) => {
    if (state === 'occupied') {
      ctx.fillStyle = '#db383f'
      const textWidth = ctx.measureText('CON PERMISO').width
      ctx.fillText('CON PERMISO', daysWidth[day as keyof typeof daysWidth] - (textWidth) / 2 - 3, daysHeight[hour as keyof typeof daysHeight] + 8)
      return
    }
    ctx.fillStyle = state === 'attended' ? '#00bf63' : '#e5b95c'
    const textWidth = ctx.measureText(fullname).width
    ctx.fillText(fullname, daysWidth[day as keyof typeof daysWidth] - (textWidth / 2) - 3, daysHeight[hour as keyof typeof daysHeight] + 8)
  })

  const imgBuffer = canvas.toBuffer('image/png')
  return imgBuffer
}