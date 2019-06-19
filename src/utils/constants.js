module.exports = Object.freeze({
    userRoles: {
        customer        : 'customer',
        serviceProvider : 'serviceProvider',
        admin           : 'admin'
    },
    accessRoles: {
        admin: {
            admin       : 'admin',
            superAdmin  : 'superAdmin'
        },
        customer: {
            customer    : 'customer',
            influencer  : 'influencer'
        },
        serviceProvider : {
            serviceProvider: 'serviceProvider'
        }
    },
    platforms: {
        android         : 'android',
        ios             : 'ios',
        web             : 'web',
        mobileWeb       : 'mobileWeb'
    },
    resource: {
        admin           : 'admin',
        customer        : 'customer',
        serviceProvider : 'serviceProvider',
        businessTypes   : 'businessTypes',
        businessSubTypes: 'businessSubTypes',
        allServiceProviders: 'allServiceProviders',
        allCustomers    : 'allCustomers'
    },
    businessModelTypes: {
        b2c: 1,
        b2b: 2,
        c2c: 3,
        b2g: 4,
        g2c: 5,
        g2b: 6
    },
    conversationTypes   : {
        single          : 'single',
        channel         : 'channel',
        group           : 'group',
        campaign        : 'campaign'
    },
    messageType         : {
        text            : 'text',
        notificaiton    : 'notificaiton'
    }
})