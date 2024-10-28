import { AppointmentIntervalDTO } from '@interfaces/appointment.interface'

export const generateIntervals = (data: AppointmentIntervalDTO) => {
  const { day, start, end } = data
  const startTime = parseInt(start.split(':')[0])
  const endTime = parseInt(end.split(':')[0])
  const intervals:AppointmentIntervalDTO[] = []
  for (let i = startTime; i < endTime; i++) {
    if (i !== 12 && i !== 13) {
      intervals.push({
        day,
        start: `${i}:00:00`,
        end: `${i + 1}:00:00`,
      })
    }
  }
  return intervals
}