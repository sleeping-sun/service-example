module.exports = {
    service_groups: [
        {
            name: 'service_group1',
            services: ['operator/get-request']
        },
        {
            name: 'service_group2',
            services: ['operator/get-request']
        }
    ],
    spawn_limit: 10
};