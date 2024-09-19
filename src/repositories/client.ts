import { ResultSetHeader } from 'mysql2'
import { ClientDTO, CreateClientDTO } from '../interfaces/client.interface'
import { dbConnection } from '../services/connection'

export class ClientRepository {
  static getClientByNumber = async (number: string) => {
    const sql = 'SELECT * FROM client WHERE phone = ?;'
    try {
      const [rows] = await dbConnection.query<ClientDTO[]>(sql, [number])
      return rows
    } catch (error) {
      console.log('Error getting client by number: ', error)
      return []
    }
  }

  static createClient = async (client: CreateClientDTO) => {
    const sql = 'INSERT INTO client (id_client, phone, full_name, dni) VALUES (uuid(), ?, ?, ?);'
    try {
      const [results] = await dbConnection.query<ResultSetHeader>(sql, [client.phone, client.fullname, client.dni])
      if (results.affectedRows === 0) return 'No se pudo crear el cliente'
      return 'Cliente creado exitosamente'
    } catch (error) {
      console.log('Error creating client: ', error)
      return 'No se pudo crear el cliente'
    }
  }
}