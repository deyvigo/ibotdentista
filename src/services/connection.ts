import { createPool } from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

export const dbConnection = createPool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  multipleStatements: true
})

export const createDatabase = async () => {
  const queryNumber = `
  create table if not exists number
  (
    id_number uuid         not null
      primary key,
    phone     varchar(15)  not null
  )
  `
  const queryClient = `
    create table if not exists client
    (
      id_client uuid         not null
        primary key,
      full_name varchar(255) not null,
      dni       varchar(10)  not null,
      id_number uuid         not null,
      constraint client_number_id_number_fk
        foreign key (id_number) references number (id_number)
    );
  `
  const queryDoctor = `
    create table if not exists doctor
    (
      id_doctor  uuid        not null
        primary key,
      phone      varchar(15) not null,
      first_name varchar(70) not null,
      last_name  varchar(70) not null
    );
  `
  const queryAdmin = `
    create table if not exists admin
    (
      id_admin            uuid        not null
        primary key,
      phone               varchar(15)  not null,
      full_name           varchar(255) not null,
      added_by_admin_id   uuid,
      constraint admin_admin_added_by_admin_id_fk
        foreign key (added_by_admin_id) references admin (id_admin)
        on delete set null
    );
  `
  const queryAppointment = `
    create table if not exists appointment
    (
      id_appointment          uuid        not null
        primary key,
      day                     date        not null,
      hour                    time        not null,
      state                   varchar(15) not null,
      reason                  text        not null,
      id_doctor               uuid        not null,
      id_client               uuid        null,
      modified_by_admin_id    uuid        null,
      constraint appointment_client_id_client_fk
        foreign key (id_client) references client (id_client),
      constraint appointment_doctor_id_doctor_fk
        foreign key (id_doctor) references doctor (id_doctor),
      constraint appointment_admin_id_modified_by_admin_fk
        foreign key (modified_by_admin_id) references admin (id_admin)
        on delete set null
    );
  `
  const queryBlockTime = `
    create table if not exists block_time
    (
      id_block_time uuid not null
        primary key,
      day           date not null,
      start         time not null,
      end           time not null,
      id_doctor     uuid not null,
      constraint block_time_doctor_id_doctor_fk
        foreign key (id_doctor) references doctor (id_doctor)
    );
  `
  const querySchedule = `
    create table if not exists schedule
    (
      id_schedule uuid        not null
        primary key,
      day         varchar(20) not null,
      start       time        not null,
      end         time        not null,
      id_doctor   uuid        not null,
      constraint schedule_doctor_id_doctor_fk
        foreign key (id_doctor) references doctor (id_doctor)
    );
  `
  const queryService = `
    create table if not exists service
    (
      id_service   uuid           not null
        primary key,
      name         varchar(100)   not null,
      description  text           not null,
      id_doctor    uuid           not null,
      constraint service_doctor_id_doctor_fk
        foreign key (id_doctor) references doctor (id_doctor)
    );
  `

  try {
    await dbConnection.query('begin')

    await dbConnection.query(queryNumber)
    await dbConnection.query(queryClient)
    await dbConnection.query(queryDoctor)
    await dbConnection.query(queryAdmin)
    await dbConnection.query(queryAppointment)
    await dbConnection.query(queryBlockTime)
    await dbConnection.query(querySchedule)
    await dbConnection.query(queryService)

    await dbConnection.query('commit')
    console.log('Base de datos creada exitosamente')
  } catch (error) {
    await dbConnection.query('rollback')
    console.log('Error al crear la base de datos: ', error)
  }
}
