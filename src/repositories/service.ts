import { ResultSetHeader } from 'mysql2'
import { CreateServiceDTO, ServiceDTO } from '@interfaces/service.interface'
import { dbConnection } from '@services/connection'

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

  static createService = async (service: CreateServiceDTO) => {
    const sql = 'INSERT INTO service (id_service, name, cost, id_doctor) VALUES (uuid(), ?, ?, ?);'
    try {
      const [results] =await dbConnection.query<ResultSetHeader>(sql, [service.name, service.cost, service.id_doctor])
      if (results.affectedRows === 0) return 'No se pudo crear el servicio'
      return 'Servicio creado exitosamente'
    } catch (error) {
      console.log('Error creating service: ', error)
      return 'No se pudo crear el servicio'
    }
  }
}