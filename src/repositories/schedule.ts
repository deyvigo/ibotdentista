import { ScheduleDTO } from '../interfaces/schedule.interface'
import { dbConnection } from '../services/connection'

export class ScheduleRepository {
  static getSchedule = async () => {
    const query = 'SELECT * FROM schedule;'
    try {
      const [rows] = await dbConnection.query<ScheduleDTO[]>(query)
      return rows
    } catch (err) {
      return []
    }
  }

  static getByDay = async (day: string) => {
    const query = 'SELECT * FROM schedule WHERE day = ?;'
    try {
      const [rows] = await dbConnection.query<ScheduleDTO[]>(query, [day])
      return rows
    } catch (err) {
      console.error('Error getting schedule by day: ', err)
      return []
    }
  }
}
