// environment.prod.ts - 生产环境配置
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api/v1',
  pythonApiUrl: 'https://your-production-api.com/stock-api',
  
  enableDebugMode: false,
  tokenKey: 'auth_token',
  userKey: 'current_user'
};
