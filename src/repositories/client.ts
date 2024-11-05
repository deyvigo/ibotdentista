import { ResultSetHeader } from 'mysql2'
import { ClientDTO, CreateClientDTO } from '@interfaces/client.interface'
import { dbConnection } from '@services/connection'

export class ClientRepository {
  static getClientByNumber = async (number: string) => {
    const sql = `
    SELECT c.id_client, c.full_name, c.dni, n.phone
    FROM client c
    JOIN number n ON n.id_number = c.id_number
    WHERE n.phone = ?
    `
    try {
      const [rows] = await dbConnection.query<ClientDTO[]>(sql, [number])
      return rows
    } catch (error) {
      console.log('Error getting client by number: ', error)
      return []
    }
  }

  static createClient = async (client: CreateClientDTO) => {
    const sql = 'INSERT INTO client (id_client, full_name, dni, id_number) VALUES (uuid(), ?, ?, ?);'
    try {
      const [results] = await dbConnection.query<ResultSetHeader>(sql, [client.fullname, client.dni, client.id_number])
      if (results.affectedRows === 0) return 'No se pudo crear el cliente'
      return 'Cliente creado exitosamente'
    } catch (error) {
      console.log('Error creating client: ', error)
      return 'No se pudo crear el cliente'
    }
  }

  static getClientById = async (idClient: string) => {
    const sql = `
    SELECT c.id_client, c.full_name, c.dni, n.phone
    FROM client c
    JOIN number n ON c.id_number = n.id_number
    WHERE c.id_client = ?;`
    try {
      const [rows] = await dbConnection.query<ClientDTO[]>(sql, [idClient])
      return rows
    } catch (error) {
      console.log('Error getting client by id: ', error)
      return []
    }
  }

  static getClientByDNI = async (dni: string) => {
    const sql = `
    SELECT id_client, full_name, dni, n.phone
    FROM client c
    JOIN number n ON n.id_number = c.id_number
    WHERE c.dni = ?;
    `
    try {
      const [rows] = await dbConnection.query<ClientDTO[]>(sql, [dni])
      return rows
    } catch (error) {
      console.log('Error getting client by dni: ', error)
      return []
    }
  }
}