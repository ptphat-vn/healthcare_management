import { MongoClient, Db } from 'mongodb'
import { env } from './environment.config'

let client: MongoClient | null = null
let database: Db | null = null

export const connectMongo = async (): Promise<Db> => {
  if (database) return database
  client = new MongoClient(env.MONGODB_URI)
  await client.connect()
  database = client.db(env.MONGO_DB_NAME)
  return database
}

export const getDb = (): Db => {
  if (!database) throw new Error('Database not connected')
  return database
}

export const closeMongo = async (): Promise<void> => {
  if (client) await client.close()
  client = null
  database = null
}


