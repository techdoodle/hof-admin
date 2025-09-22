// Environment Configuration
export interface Environment {
    name: string;
    apiUrl: string;
    label: string;
}

export const environments: Record<string, Environment> = {
    local: {
        name: 'local',
        apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
        label: 'Local Development',
    },
    staging: {
        name: 'staging',
        apiUrl: process.env.REACT_APP_API_URL || 'https://hof-web-app-backend-staging.up.railway.app',
        label: 'Staging',
    },
    production: {
        name: 'production',
        apiUrl: process.env.REACT_APP_API_URL || 'https://hof-web-app-backend-production.up.railway.app',
        label: 'Production',
    },
};

export const getCurrentEnvironment = (): Environment => {
    const envName = process.env.REACT_APP_ENVIRONMENT || 'local';
    console.log("Environment", envName, "  " + environments[envName as keyof typeof environments], environments[envName]);
    return environments[envName] || environments.local;
};

export const isProduction = (): boolean => {
    return getCurrentEnvironment().name === 'production';
};

export const isDevelopment = (): boolean => {
    return getCurrentEnvironment().name === 'local';
};
