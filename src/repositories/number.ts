import { NumberDTO } from '@/interfaces/number.interface'
import { dbConnection } from '@services/connection'
import { ResultSetHeader } from 'mysql2'

export class NumberRepository {
  static insertOne = async (number: string) => {
    const query = 'INSERT INTO number (id_number, phone) VALUES (uuid(), ?);'
    try {
      const [rows] = await dbConnection.query<ResultSetHeader>(query, [number])
      if (rows.affectedRows === 0) return false
      return true
    } catch (error) {
      console.error('Error inserting number: ', error)
      return false
    }
  }

  static getNumberByPhone = async (phone: string) => {
    const query = 'SELECT * FROM number WHERE phone = ?;'
    try {
      const [rows] = await dbConnection.query<NumberDTO[]>(query, [phone])
      return rows
    } catch (error) {
      console.error('Error getting number by phone: ', error)
      return []
    }
  }
}