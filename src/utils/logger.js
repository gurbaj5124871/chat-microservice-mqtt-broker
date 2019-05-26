const winston   = require("winston"),
      config    = require('../../app-config');

const level     = config.get('/winston');

const logger    = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: level,
            timestamp: function () {
                return (new Date()).toISOString();
            },
            stderrLevels: ['error', 'warn'],
            // handleExceptions: true,
            // json: true,
            colorize: true
        })
    ]
});

module.exports = logger;