import { ServiceDTO } from '../interfaces/service.interface'
import { dbConnection } from '../services/connection'

export class ServiceRepository {
  static getServices = async() => {
    const sql = 'SELECT id_service, name, cost FROM service;'
    try {
      const [rows] = await dbConnection.query<ServiceDTO[]>(sql)
      return rows
    } catch (error) {
      console.log('Error getting services: ', error)
      return []
    }
  }
}