import { BlockTimeCreateDTO, BlockTimeDTO } from '@/interfaces/blocktime.interface'
import { dbConnection } from '@services/connection'
import { ResultSetHeader } from 'mysql2'

export class BlockTimeRepository {
  static createBlockTime = async (blocktime: BlockTimeCreateDTO) => {
    const query = 'INSERT INTO block_time (id_block_time, day, start, end, id_doctor) VALUES (uuid(), ?, ?, ?, ?);'
    try {
      const { day, start, end, id_doctor } = blocktime
      const [rows] = await dbConnection.query<ResultSetHeader>(query, [day, start, end, id_doctor])
      if (rows.affectedRows === 0) return 'No se pudo crear el bloqueo de horario'
      return 'Horarios cancelados exitosamente'
    } catch (error) {
      console.error('Error creating blocktime: ', error)
      return 'No se pudo crear el bloqueo de horario'
    }
  }

  static getBlockTimeById = async (idBlockTime: string) => {
    const query = 'SELECT * FROM block_time WHERE id_block_time = ?;'
    try {
      const [rows] = await dbConnection.query<BlockTimeDTO[]>(query, [idBlockTime])
      return rows
    } catch (error) {
      console.error('Error getting blocktime by id: ', error)
      return []
    }
  }
}