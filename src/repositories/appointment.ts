import { ResultSetHeader } from 'mysql2'
import { dbConnection } from '../services/connection'
import { AppointmentClientDTO, AppointmentDoctorDTO, AppointmentDTO, CreateAppointmentDTO } from '../interfaces/appointment.interface'
import { SessionDoctorSchedule } from '../interfaces/session.interface'
import { DateState } from '../utils/date'

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
    SELECT a.id_appointment, a.day, a.hour, a.reason, a.state, a.modified_by_admin_id, c.phone, c.dni, c.full_name as fullname, CONCAT(d.last_name, ', ', d.first_name) AS doctor_name
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

  static deleteAppointmentByIdClient = async (idClient: string) => {
    const query = `
    DELETE FROM appointment
    WHERE id_client = ? AND state = 'pending';
    `
    try {
      const [result] = await dbConnection.query<ResultSetHeader>(query, [idClient])
      if (result.affectedRows === 0) return 'No se pudo eliminar su cita'
      return 'Su cita ha sido eliminada'
    } catch (error) {
      console.error('Error deleting appointment by id client: ', error)
      return 'No se pudo eliminar su cita'
    }
  }

  static getAllByDay = async (day: string) => {
    const query = `
    SELECT c.full_name, c.dni, a.hour, c.phone, a.state
    FROM appointment a
    LEFT JOIN client c ON c.id_client = a.id_client
    WHERE a.day = ?;
    `
    try {
      const [rows] = await dbConnection.query<AppointmentDoctorDTO[]>(query, [day])
      return rows
    } catch (error) {
      console.error('Error getting appointment by day: ', error)
      return []
    }
  }

  static cancelDayInterval = async (intervals: SessionDoctorSchedule[], idDoctor: string, ) => {
    const connection = await dbConnection.getConnection()
    try {
      await connection.beginTransaction()
      for (const interval of intervals) {
        const { day, start } = interval
        const q = 'SELECT * FROM appointment WHERE day = ? AND hour = ?;'
        const [rowsA] = await dbConnection.query<AppointmentDTO[]>(q, [day, start])
        if (rowsA.length > 0) {
          const qUpdate = `UPDATE appointment SET state = 'occupied' WHERE day = ? AND hour = ? AND state = 'pending';`
          await dbConnection.query(qUpdate, [day, start])
        } else {
          const qInsert = `
          INSERT INTO appointment (id_appointment, day, hour, state, reason, id_doctor, id_client, modified_by_admin_id)
          VALUES
          (uuid(), ?, ?, 'occupied', 'Horario libre de doctor', ?, null, null);
          `
          await dbConnection.query(qInsert, [day, start, idDoctor])
        }
      }
      await connection.commit()
      return true
    } catch (error) {
      await connection.rollback()
      console.error(error)
      return false
    } finally {
      connection.release()
    }
  }

  static getPendingAppointments = async () => {
    const query = `
    SELECT a.id_appointment, a.day, a.hour, a.reason, a.state, a.modified_by_admin_id, c.phone, c.dni, c.full_name as fullname, CONCAT(d.last_name, ', ', d.first_name) AS doctor_name
    FROM appointment a
    JOIN client c ON a.id_client = c.id_client
    JOIN doctor d ON a.id_doctor = d.id_doctor
    WHERE a.state = 'pending';
    `
    try {
      const [rows] = await dbConnection.query<AppointmentClientDTO[]>(query)
      return rows
    } catch (error) {
      console.error('Error getting pending appointments: ', error)
      return []
    }
  }

  static changeStatusById = async (idAppointment: string, state: DateState) => {
    const query = 'UPDATE appointment SET state = ? WHERE id_appointment = ?;'
    try {
      const [resul] = await dbConnection.query<ResultSetHeader>(query, [state, idAppointment])
      if (resul.affectedRows === 0) return 'No se pudo cambiar el estado de la cita'
      return 'Estado de la cita cambiada'
    } catch (error) {
      console.error('Error changing status appointment: ', error)
      return 'No se pudo cambiar el estado de la cita'
    }
  }

  static getByDayAndHourInteval = async (day: string, start: string, end: string) => {
    const query = `
    SELECT a.id_appointment, a.day, a.hour, a.reason, a.state, a.modified_by_admin_id, c.phone, c.dni, c.full_name as fullname, CONCAT(d.last_name, ', ', d.first_name) AS doctor_name
    FROM appointment a
    JOIN client c ON a.id_client = c.id_client
    JOIN doctor d ON a.id_doctor = d.id_doctor
    WHERE a.state = 'pending'
    AND a.day = ?
    AND a.hour >= ?
    AND a.hour < ?;
    `
    try {
      const [rows] = await dbConnection.query<AppointmentClientDTO[]>(query, [day, start, end])
      return rows
    } catch (error) {
      console.error('Error getting appointment by day and hour: ', error)
      return []
    }
  }
}
