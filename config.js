module.exports = {
    service_groups: [
        {
            name: 'service_group1',
            services: ['operator/get-request', 'operator/get-request', 'missing_service']
        },
        {
            name: 'service_group2',
            services: ['operator/get-request']
        }
    ],
    spawn_limit: 10
};