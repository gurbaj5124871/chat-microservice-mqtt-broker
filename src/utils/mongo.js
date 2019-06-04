const monogdb       = require('../../bootstrap/mongo').db

const collections   = {
    customermqtts   : 'customermqtts',
    serviceprovidermqtts: 'serviceprovidermqtts'
}

module.exports      = {monogdb, collections}