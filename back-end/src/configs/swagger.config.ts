import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import { readFileSync } from 'fs'
import { join } from 'path'
import YAML from 'yaml'

const swaggerYamlPath = join(__dirname, '../../swagger.yaml')
const swaggerYamlContent = readFileSync(swaggerYamlPath, 'utf8')

const swaggerDocument = YAML.parse(swaggerYamlContent)

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Healthcare Management API',
      version: '1.0.0',
      description: 'API documentation for Healthcare Management System',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], 
}

const swaggerSpecs = swaggerJsdoc(swaggerOptions)

export { swaggerDocument, swaggerSpecs, swaggerUi }
