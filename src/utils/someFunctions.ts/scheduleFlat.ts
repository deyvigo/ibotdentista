import { ScheduleDTO } from "@/interfaces/schedule.interface";

export const scheduleToFlat = (schedule: ScheduleDTO[]) => {
  return schedule.flatMap(({ day, start, end }) => {
    let flat: { day: string, hour: string }[] = []
    const startTime = parseInt(start.split(':')[0])
    const endTime = parseInt(end.split(':')[0])

    for (let i = startTime; i <= endTime; i++) {
      if (i !== 12 && i !== 13) {
        flat.push({
          day,
          hour: `${i < 10 ? '0' : ''}${i}:00:00`,
        })
      }
    }
    return flat
  })
}