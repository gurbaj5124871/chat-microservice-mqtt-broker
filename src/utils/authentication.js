const bluebird          = require('bluebird'), 
    jwt                 = bluebird.promisifyAll(require('jsonwebtoken')),
    sessions            = require('./sessions'),
    config              = require('../../app-config');

const secret            = config.get('/jwt/secret')

const verifyToken       = async token => {
        try             {
            token       = token.split(' ')
            if(token.length !== 2 && token[0].toLowerCase() !== 'bearer')
                throw new Error('Token Expired')
            else token  = token[1]
            try         {
                const decode    = await jwt.verifyAsync(token, secret)
                const session   = (await sessions.getSessionFromToken(decode))[0]
                if(!session)
                    throw new Error('Token Expired')
                return Object.assign(decode, JSON.parse(session))
            } catch(err){
                try {await sessions.expireSessionFromToken(jwt.decode(token, {json: true, complete: true}))} catch(err) {}
                throw new Error('Token Expired')
            }
        } catch (err)   {
            throw err
        }
}

const verifyTokenIfExists   = async (req, res, next) => {
    if(req.headers.authorization)
        return verifyToken(req, res, next)
    else next()
}

const generateToken         = async (userId, sessionId, role, roles, platform) => {
    const expiry            = config.get(`/jwt/expireAfter/${role}/${platform}`) || '1d';
    return jwt.signAsync({
        userId: userId.toString(), sessionId: sessionId.toString(),
        role, roles, issuer: 'dhandahub.com'}, secret, {expiresIn: expiry
    })
}

module.exports      = {
    verifyToken,
    verifyTokenIfExists,
    generateToken
}