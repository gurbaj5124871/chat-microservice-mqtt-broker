const admin             = require("firebase-admin"),
      serviceAccount    = require('../modules/notifications/notification-config.json');

admin.initializeApp({credential: admin.credential.cert(serviceAccount)})

module.exports          = admin;