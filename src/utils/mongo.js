const monogdb       = require('../../bootstrap/mongo').db

const collections   = {
    customers       : 'customers',
    serviceproviders: 'serviceproviders',
    customermqtts   : 'customermqtts',
    serviceprovidermqtts: 'serviceprovidermqtts'
}

module.exports      = {monogdb, collections}