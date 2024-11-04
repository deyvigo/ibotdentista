import { AppointmentClientDTO } from '@interfaces/appointment.interface'
import { createCanvas, loadImage } from 'canvas'

export const createImageAppointmentsClient = async (data: AppointmentClientDTO[]) => {
  const width = 1920
  const height = 620 + data.length * 132
  const canvas = createCanvas(width, height)

  const ctx = canvas.getContext('2d')
  
  const backgroundColor = '#84b4b3'
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)

  // load top image
  const imageTop = await loadImage('./src/services/images/mocks/hora-top.png')
  ctx.drawImage(imageTop, 0, 0, imageTop.width, imageTop.height)

  // load bottom image
  const imageBottom = await loadImage('./src/services/images/mocks/hora-bottom.png')
  ctx.drawImage(imageBottom, 0, height - imageBottom.height, imageBottom.width, imageBottom.height)

  // set font
  ctx.font = 'bold 24px "More Sugar"'

  // load middle image
  const imageMiddle = await loadImage('./src/services/images/mocks/hora-mid.png')
  ctx.fillStyle = '#000'
  data.forEach(({ hour, dni, fullname, day }, index) => {
    const date = new Date(day).toISOString().split('T')[0]
    ctx.drawImage(imageMiddle, 0, imageTop.height + index * imageMiddle.height, imageMiddle.width, imageMiddle.height)
    const hourWidth = ctx.measureText(hour).width
    ctx.fillText(hour, 343 - hourWidth/2 - 3, imageTop.height + index * imageMiddle.height + imageMiddle.height / 2 + 8)
    const dateWidth = ctx.measureText(date).width
    ctx.fillText(date, 671 - dateWidth/2 - 3, imageTop.height + index * imageMiddle.height + imageMiddle.height / 2 + 8)
    const nombreWidth = ctx.measureText(fullname).width
    ctx.fillText(fullname, 1124 - nombreWidth/2 - 3, imageTop.height + index * imageMiddle.height + imageMiddle.height / 2 + 8)
    const dniWidth = ctx.measureText(dni).width
    ctx.fillText(dni, 1577 - dniWidth/2 - 3, imageTop.height + index * imageMiddle.height + imageMiddle.height / 2 + 8)
  })

  // save the canvas to a file
  const buffer = canvas.toBuffer('image/png')

  return buffer
  // fs.writeFileSync('background.png', buffer)
}