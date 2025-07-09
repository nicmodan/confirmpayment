const app = require('./app') // the actual Express application
const config = require('./utils/config')
const logger = require('./utils/logger')

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`)
})