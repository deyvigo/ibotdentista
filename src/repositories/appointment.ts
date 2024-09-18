import { ResultSetHeader } from 'mysql2'
import { dbConnection } from '../services/connection'
import { SessionDoctorSchedule } from '../interfaces/session.interface'
import { AppointmentDTO, CreateAppointmentDTO } from '../interfaces/appointment.interface'

export class AppointmentRepository {
  static getDoctorAppointments = async (day: string) => {
    const query = `SELECT * FROM appointment WHERE day = ? AND state = 'pending'`
    try {
      const [rows] = await dbConnection.query<AppointmentDTO[]>(query, [day])
      return rows
    } catch (error) {
      console.error(error)
      return []
    }
  }

  static createAppointment = async (appointment: CreateAppointmentDTO) => {
    const query = `INSERT INTO appointment (id_appointment, day, hour, state, id_doctor, id_client) VALUES (uuid(), ?, ?, ?, ?, ?)`
    try {
      const { day, hour, state, id_doctor, id_client } = appointment
      const [rows] = await dbConnection.query<ResultSetHeader>(query, [day, hour, state, id_doctor, id_client])
      return rows
    } catch (error) {

    }
  }
}
