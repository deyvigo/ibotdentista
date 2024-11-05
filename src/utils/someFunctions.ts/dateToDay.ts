import { AppointmentDoctorDTO } from '@/interfaces/appointment.interface'

export const dateToDay = (data: AppointmentDoctorDTO[]) => {
  return data.map(({ day, hour, full_name, state }) => {
    const date = new Date(day)
    const dayName = date.toLocaleString('es-ES', { weekday: 'long' })
    const arrName = full_name?.split(' ') || []
    let name = arrName[0] || ''

    if (arrName.length === 2 || arrName.length === 3) {
      name = `${arrName[0]} ${arrName[1]}`
    } else if (arrName.length === 4) {
      name = `${arrName[0]} ${arrName[2]}`
    } else if (arrName.length === 5) {
      name = `${arrName[0]} ${arrName[3]}`
    }

    return {
      day: dayName,
      hour,
      fullname: name,
      state
    }
  })
}