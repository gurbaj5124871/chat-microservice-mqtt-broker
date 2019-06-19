const convertToAlphaNumeric =  str => str.replace(/[^0-9a-z]/gi, '')

const convertDaysToSeconds  = noOfDays => noOfDays * 86400 // 60 * 60 * 24

const mongoUUID             = id => {
    const ObjectID          = require('mongodb').ObjectID
    return id ? ObjectID(id): ObjectID()
}


module.exports              = {
    convertToAlphaNumeric,
    convertDaysToSeconds,
    mongoUUID
}