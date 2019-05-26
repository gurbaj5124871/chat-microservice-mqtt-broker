'use strict';

const cassandra = require('cassandra-driver'),
    cassandraConfig = require('../app-config').get('/cassandra');

const authProvider = cassandraConfig.user !== undefined ?
    new cassandra.auth.PlainTextAuthProvider(cassandraConfig.user, cassandraConfig.password) : undefined;

const client = new cassandra.Client({
    contactPoints: cassandraConfig.contactPoints, keyspace: cassandraConfig.keyspace,
    localDataCenter: cassandraConfig.localDataCenter, authProvider: authProvider
});

exports.connect = callback => {
    client.connect(err => {
        if (err)
            return callback(err);
        callback();
    });
};

exports.client = client;