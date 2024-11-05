export const formatDate = (date: Date) => {
  const dayOfWeek = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date)
  const day = date.getDate()
  const month = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date)
  const year = date.getFullYear()
  const dayString = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)

  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')

  return `${dayString}, ${day} de ${month} de ${year}`
}