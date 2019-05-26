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
    businessOwnershipTypes: {
        soleProprietor      : 1, // very small businesses, single owner or a married couple. ex:  man-in-a-van type bussiness
        partnership         : 2, // relationship existing between two or more persons who join to carry on a trade or business

        // company type divided into their sizes
        companyStartup      : 3, // A company is a legal entity made up of an association of persons,
        companyCoorperate   : 4, // be they natural, legal, or a mixture of both, for carrying on a commercial or industrial enterprise

        franchise           : 4, // Franchises are licensing arrangements whereby an individual or group can buy the right to trade and produce under a well-known brand name in a given locality
        limitedLiability    : 5 // Limited liability is a type of liability that does not exceed the amount invested in a partnership or limited liability company.
    },
    socialProfileTypes: {
        youtube     : 'youtube',
        instagram   : 'instagram',
        twitter     : 'twitter',
        facebook    : 'facebook'
    },
    reservedHandles : [
        'search', 'find', 'user', 'users', 'featured', 'top', 'people', 'profile', 'campaign', 'marketing', 'sale', 'sales', 'competition',
        'portfolio', 'profiles', 'portfolios', 'hi', 'terms', 'privacy', 'tnc', 'termsandconditions', 'privacypolicy', 'team', 'competitions',
        'sitemap', 'blog', 'contact', 'dev', 'chat', 'message', 'event', 'customer', 'customers', 'sp', 'serviceprovider', 'serviceproviders'
    ]
})