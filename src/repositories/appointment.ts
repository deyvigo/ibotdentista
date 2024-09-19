import { ResultSetHeader } from 'mysql2'
import { dbConnection } from '../services/connection'
import { SessionDoctorSchedule } from '../interfaces/session.interface'
import { AppointmentClientDTO, AppointmentDTO, CreateAppointmentDTO } from '../interfaces/appointment.interface'

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
    const query = `
    INSERT INTO appointment (id_appointment, day, hour, state, reason, id_doctor, id_client, modified_by_admin_id)
    VALUES
    (uuid(), ?, ?, ?, ?, ?, ?, null);`
    try {
      const { day, hour, state, reason, id_doctor, id_client } = appointment
      const [rows] = await dbConnection.query<ResultSetHeader>(query, [day, hour, state, reason, id_doctor, id_client])
      if (rows.affectedRows === 0) return 'No se pudo crear la cita'
      return 'Cita creada'
    } catch (error) {
      console.error('Error creating appointment: ', error)
      return 'No se pudo crear la cita'
    }
  }

  static getAppointmentByClientNumber = async (clientNumber: string) => {
    const query = `
    SELECT a.id_appointment, a.day, a.hour, a.reason, a.modified_by_admin_id, c.full_name as fullname, CONCAT(d.last_name, ', ', d.first_name) AS doctor_name
    FROM appointment a
    JOIN client c ON a.id_client = c.id_client
    JOIN doctor d ON a.id_doctor = d.id_doctor
    WHERE c.phone = ? AND a.state = 'pending';
    `
    try {
      const [rows] = await dbConnection.query<AppointmentClientDTO[]>(query, [clientNumber])
      return rows
    } catch (error) {
      console.error('Error getting appointment by client number: ', error)
      return []
    }
  }

  static getByDayAndHour = async (day: string, hour: string) => {
    const query = 'SELECT * FROM appointment WHERE day = ? AND hour = ?;'
    try {
      const [result] = await dbConnection.query<AppointmentDTO[]>(query, [day, hour])
      return result
    } catch (error) {
      console.error('Error getting appointment by day and hour: ', error)
      return []
    }
  }
}
