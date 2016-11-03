export const rawAccountDetails = {
    account: {
        details: {
            name: 'Testing123',
            age: 32,
            isAwesome: true,
            isSmelly: false,
            regex: '^[a-z]*$',
            summary: {
                location: {
                    address: {
                        streetAddress: '150 Granby St',
                        city: 'Norfolk',
                        stateCode: 'VA',
                        zip_code: '23510',
                    },
                },
                cellPhone: '(999) 999-9999',
            },
        },
    },
    emailAddresses: [
        {
            address: 'someemail@yahoo.com',
            active: true,
        },
        {
            address: 'anotheremail@yahoo.com',
            active: false,
        }
    ],
};
