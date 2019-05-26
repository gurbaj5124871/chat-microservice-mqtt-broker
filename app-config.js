'use strict';

const Confidence        = require('confidence');

const criteria          = {
    env : process.env.NODE_ENV
}

const config            = {
    microServiceName    : 'thor',
    
    mqttPort                : {
        $filter         : 'env',
        dev             : 2883,
        test            : 1883,
        prod            : 1883,
        $default        : 2883
    },
    websocketPort                : {
        $filter         : 'env',
        dev             : 8883,
        test            : 8883,
        prod            : 8883,
        $default        : 8883
    },

    jwt                 : {
        secret          : {
            $filter     : 'env',
            dev         : "development_secret",
            test        : "development_secret",
            prod        : "development_secret",
            $default    : "development_secret"
        },
        expireAfter     : {
            admin       : {
                web     : '1d'
            },
            serviceProvider: {
                android : '30d',
                ios     : '30d',
                web     : '7d',
                mobileWeb: '1d'
            },
            customer    : {
                android : '30d',
                ios     : '30d',
                web     : '1d',
                mobileWeb: '1d'
            }
        }
    },

    winston             : {
        $filter         : 'env',
        dev             : 'debug',
        test            : 'debug',
        prod            : 'info'
    },

    cassandra           : {
        $filter         : 'env',
        dev             : {keyspace: 'dhandahub_chat', contactPoints: ['localhost'], localDataCenter: 'datacenter1'},
        test            : {keyspace: 'dhandahub_chat', contactPoints: ['localhost'], localDataCenter: 'datacenter1'},
        prod            : {
                            keyspace: 'dhandahub_chat', user: 'chat', password: 'tTyGQTMqTFkkQeA',
                            contactPoints: ["thor1.dhandahub.com", "thor2.dhandahub.com"], localDataCenter: 'ap-south'
                            
        },
        $default        : {keyspace: 'dhandahub_chat', contactPoints: ['localhost'], localDataCenter: 'datacenter1'}
    },

    mongodb             : {
        $filter         : 'env',
        dev             : {url: `mongodb://localhost:27017`, db: 'dhandahub'},
        test            : {url: `mongodb://localhost:27017`, db: 'dhandahub'},
        prod            : {url: `mongodb://localhost:27017`, db: 'dhandahub'},
        $default        : {url: `mongodb://localhost:27017`, db: 'dhandahub'},
    },

    redis: {
        $filter         : 'env',
        dev             : 'redis://127.0.0.1:6379',
        test            : 'redis://localhost:6379',
        prod            : 'redis://127.0.0.1:6379',
        $default        : 'redis://localhost:6379'
    },

    redisPubSub         : {
        $filter         : 'env',
        dev             : {port: 6379, host: '127.0.0.1', db: 2},
        test            : {port: 6379, host: '127.0.0.1', password: 'password', db: 2},
        prod            : {port: 6379, host: '127.0.0.1', password: 'password', db: 2},
        $default        : {port: 6379, host: '127.0.0.1', db: 2}
    }
}

// Caching server configs and constants
const store             = new Confidence.Store(config)
const get               = key => store.get(key, criteria)
const meta              = key => store.meta(key, criteria)

module.exports          = { get, meta }