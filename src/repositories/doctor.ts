import { Doctor } from '../interfaces/doctor.interface'
import { dbConnection } from './../services/connection'

export class DoctorRepository {
  static getDoctors = async () => {
    const query = 'SELECT * FROM doctor;'
    const [rows] = await dbConnection.query<Doctor[]>(query)
    return rows
  }
}
