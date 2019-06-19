'use strict'

const Joi               = require('@hapi/joi'),
    constants           = require('../utils/constants'),
    mongoIdRegex        = /^[0-9a-fA-F]{24}$/;

const message           = payload => {
    const schema        = Joi.object().keys({
        data            : Joi.object().keys({
            conversation_id     : Joi.string().required(),
            last_message_content: Joi.string().required(),
            last_message_type   : Joi.string().valid(Object.values(constants.messageType))
        })
    })
    validate(payload, schema)
}

const block             = payload => {
    const schema        = Joi.object().keys({
        data            : Joi.object().keys({
            conversation_id     : Joi.string().required(),
            is_blocked          : Joi.boolean().required()
        })
    })
    validate(payload, schema)
}

const addOrRemoveUser   = payload => {
    const schema        = Joi.object().keys({
        data            : Joi.object().keys({
            conversation_id     : Joi.string().required(),
            user_id             : Joi.string().required().regex(mongoIdRegex)
        })
    })
    validate(payload, schema)
}

function validate(payload, schema) {
    const {error}       = Joi.validate(payload, schema)
    if(error)
        throw new Error('Validation Failed')
}

module.exports          = {
    message,
    block,
    addOrRemoveUser
}