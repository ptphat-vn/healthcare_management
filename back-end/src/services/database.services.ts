import { MongoClient, Db, Collection, Document } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

let client: MongoClient | null = null
let database: Db | null = null

const getMongoUri = (): string => {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not set')
  }
  return uri
}

export const connectDatabase = async (): Promise<Db> => {
  if (database) return database
  const uri = getMongoUri()
  client = new MongoClient(uri)
  await client.connect()
  const dbName = process.env.MONGO_DB_NAME || 'app'
  database = client.db(dbName)
  return database
}

export const getDatabase = (): Db => {
  if (!database) {
    throw new Error('Database not connected. Call connectDatabase first')
  }
  return database
}

export const getCollection = <TSchema extends Document = Document>(name: string): Collection<TSchema> => {
  return getDatabase().collection<TSchema>(name)
}

export const disconnectDatabase = async (): Promise<void> => {
  if (client) {
    await client.close()
    client = null
    database = null
  }
}


