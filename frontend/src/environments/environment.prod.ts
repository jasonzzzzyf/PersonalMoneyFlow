// environment.prod.ts - 生产环境配置
// TODO: Replace BACKEND_RENDER_URL with your actual Render backend URL after first deploy
// Example: https://personalmoneyflow-backend.onrender.com/api/v1
// export const environment = {
//   production: true,
//   apiUrl: 'https://BACKEND_RENDER_URL/api/v1',
//   pythonApiUrl: 'https://BACKEND_RENDER_URL/stock-api',

//   enableDebugMode: false,
//   tokenKey: 'auth_token',
//   userKey: 'current_user'
// };

export const environment = {
  production: true,
  demoMode: true,
  apiUrl: '',
  pythonApiUrl: '',
  enableDebugMode: false,
  tokenKey: 'auth_token',
  userKey: 'current_user'
};