import { AppointmentDisponibilityDTO } from '@/interfaces/appointment.interface'
import { formatDate } from '@/utils/formatDate'
import { createCanvas, loadImage } from 'canvas'

export const createImageDisponibility = async (data: AppointmentDisponibilityDTO[], dayString: string) => {
  const width = 952
  const heigth = 1400
  const mapStates = {
    'pending': 'OCUPADO',
    'occupied': 'NO DISPONIBLE',
  }

  const canvas = createCanvas(width, heigth)
  const ctx = canvas.getContext('2d')

  const backgroundColor = '#84b4b3'
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, heigth)

  // load image
  const image = await loadImage('./src/services/images/mocks/disponibilidad.png')
  ctx.drawImage(image, 0, 0, image.width, image.height)

  // set date on top
  ctx.font = 'bold 28px "More Sugar"'
  ctx.fillStyle = '#000'
  const [year, month, day] = dayString.split('-').map(Number)
  const date = formatDate(new Date(year, month - 1, day))
  const dateWidth = ctx.measureText(date).width
  ctx.fillText(date, 476 - (dateWidth / 2) - 3, 209 + 8)

  const hours = [
    '08:00:00', '09:00:00', '10:00:00', '11:00:00', '12:00:00',
    '14:00:00', '15:00:00', '16:00:00', '17:00:00', '18:00:00'
  ]

  const hoursWithStates = data.map(({ day, state, hour }) => hour)
  
  hours.forEach((hour, index) => {
    if (hour === '12:00:00') {
      ctx.fillStyle = '#00bf63'
      const textWidth = ctx.measureText('HORA DE ALMUERZO').width
      ctx.fillText('HORA DE ALMUERZO', 623 - (textWidth / 2) - 3, 281 + 109 * index + 37 + 8)
    } else {
      if (hoursWithStates.includes(hour)) {
        const stateKey = data.find(({ hour: h }) => h === hour)!.state as keyof typeof mapStates
        if (stateKey) {
          const state = mapStates[stateKey]
          ctx.fillStyle = state === 'OCUPADO' ? '#e5b95c' : '#db383f'
          const stateWidth = ctx.measureText(state).width
          ctx.fillText(state, 623 - (stateWidth / 2) - 3, 281 + 109 * index + 37 + 8)
        }
      }
      ctx.fillStyle = '#00bf63'
      const freeWidth = ctx.measureText('FREE').width
      ctx.fillText('FREE', 623 - (freeWidth / 2) - 3, 281 + 109 * index + 37 + 8)
    }


  })
  

  const imgBuffer = canvas.toBuffer('image/png')
  return imgBuffer
}