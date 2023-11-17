const getEnv = () => ({
    getAcsConnectionString: () => process.env.REACT_APP_ACS_CONNECTION_STRING ?? '',
    getFluidRelayTenantId: () => process.env.REACT_APP_FR_TENANT_ID ?? '',
    getFluidRelayTenantKey: () => process.env.REACT_APP_FR_TENANT_KEY ?? '',
    getFluidRelayServiceEndpoint: () => process.env.REACT_APP_FR_SERVICE_ENDPOINT ?? '',
});

export default getEnv();