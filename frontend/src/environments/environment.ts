// environment.ts - 开发环境配置
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
  pythonApiUrl: 'http://localhost:8000/api',
  
  // 可选配置
  enableDebugMode: true,
  tokenKey: 'auth_token',
  userKey: 'current_user'
};
