export const weekToString = ({ weekInit, weekEnd }: { weekInit: string, weekEnd: string }) => {
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    const dayName = date.toLocaleString('es-ES', { weekday: 'long' })
    return {
      dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
      dayNumber: date.getDate(),
      month: date.toLocaleString('es-ES', { month: 'long' })
    }
  }

  const init = formatDate(weekInit)
  const end = formatDate(weekEnd)
  const year = new Date(weekInit).getFullYear()

  return `${init.dayName} ${init.dayNumber} de ${init.month} a ${end.dayName} ${end.dayNumber} de ${end.month}, ${year}`
}
