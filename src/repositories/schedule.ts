import { ScheduleDTO } from '../interfaces/schedule.interface'
import { dbConnection } from '../services/connection'

export class ScheduleRepository {
  static getSchedule = async () => {
    const query = `SELECT * FROM schedule;`
    try {
      const [rows] = await dbConnection.query<ScheduleDTO[]>(query)
      return rows
    } catch (err) {
      return []
    }
  }
}
