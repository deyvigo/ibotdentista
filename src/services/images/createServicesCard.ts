import { createCanvas } from 'canvas'
import { ServiceDTO } from './../../interfaces/service.interface'

export const createServicesCard = (data: ServiceDTO[]) => {
  const heightService = 80

  const n = data.length

  const paddingTop = 100
  const paddingBottom = 50
  const padding = paddingBottom + paddingTop

  const paddingSides = 50

  const height = heightService * n + padding
  const width = 500 + paddingSides * 2

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, width, height)

  // // Dibujar cuadros
  // ctx.fillStyle = '#FFFFFF'
  // ctx.lineWidth = 1
  // for (let i = 0; i < n; i++) {
  //   ctx.beginPath()
  //   ctx.moveTo(350, i * heightService + paddingTop)
  //   ctx.lineTo(350, (i + 1) * heightService + paddingTop)
  //   ctx.stroke()
  // }

  // underline
  ctx.beginPath()
  ctx.moveTo(paddingSides + 80, paddingTop + n * heightService)
  ctx.lineTo(width - paddingSides - 80, height - paddingBottom)
  ctx.stroke()

  // // Horizontal lines
  // for (let i = 0; i <= n; i++) {
  //   ctx.beginPath()
  //   ctx.moveTo(paddingSides, paddingTop + i * heightService)
  //   ctx.lineTo(width - paddingSides, paddingTop + i * heightService)
  //   ctx.stroke()
  // }

  // Escribir los servicios
  ctx.fillStyle = '#000000'
  ctx.font = 'bold 40px "Pompiere"'
  const titleWidth = ctx.measureText('Servicios').width
  const tittlePos = width / 2 - titleWidth / 2
  ctx.fillText('Servicios', tittlePos, paddingTop / 2 + 10)

  // Lineas a los lados de "Servicios"
  ctx.beginPath()
  ctx.moveTo(tittlePos - 10, paddingTop / 2)
  ctx.lineTo(tittlePos - 60, paddingTop / 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(tittlePos + titleWidth + 10, paddingTop / 2)
  ctx.lineTo(tittlePos + titleWidth + 60, paddingTop / 2)
  ctx.stroke()

  data.forEach((d, i) => {
    const h = paddingTop + i * heightService + heightService / 2 + 10
    ctx.textAlign = 'left'
    ctx.font = 'bold 30px "Pompiere"'
    ctx.fillText(d.name, 100, h)
    ctx.textAlign = 'right'
    ctx.font = 'bold 20px "Pompiere"'
    ctx.fillText('S/' + d.cost.toString(), width - 100, h)
  })

  ctx.textAlign = 'left'
  // Agregar notas al pie de la imagen
  ctx.font = 'bold 20px "Pompiere"'
  const notesWidth = ctx.measureText('*el precio es un aproximado').width
  ctx.fillText('*el precio es un aproximado', width / 2 - notesWidth / 2, height - 10)

  const buffer = canvas.toBuffer('image/png')
  return buffer
}
