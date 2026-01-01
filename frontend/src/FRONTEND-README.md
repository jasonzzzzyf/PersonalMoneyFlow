# Frontend 说明文档

## 📁 项目结构

这是一个完整的Angular前端项目src目录，已与后端API完美配对。

## ✅ 主要功能

### 1. 认证系统
- **登录**: `/auth/login`
- **注册**: `/auth/register`
- **自动Token管理**: 自动添加JWT到请求头

### 2. 核心功能页面
- **Dashboard**: 仪表板总览
- **Transactions**: 交易管理（收入/支出）
- **Analytics**: 数据分析和图表
- **Investments**: 投资组合管理
  - Portfolio: 投资概览
  - Net Worth: 净资产计算
  - Add Asset/Loan Dialog: 资产/贷款添加
- **Profile**: 个人资料管理
- **Categories**: 分类管理

### 3. 技术特性
- ✅ Angular 17
- ✅ Angular Material UI
- ✅ 响应式设计
- ✅ JWT认证
- ✅ HTTP拦截器（自动添加token）
- ✅ 路由守卫（保护私有页面）
- ✅ 黄色主题 (#F5D547)

## 🔧 API端点配置

### 环境配置
**文件**: `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1'
};
```

### API服务

所有服务都使用统一的API_URL配置：

1. **AuthService** (`src/app/core/auth/auth.service.ts`)
   - POST `/auth/register`
   - POST `/auth/login`
   - GET `/auth/me`

2. **AnalyticsComponent** (`src/app/features/analytics/analytics.component.ts`)
   - GET `/analytics/income-expense?startDate=XX&endDate=XX`

3. **TransactionService** (如果存在)
   - GET `/transactions`
   - POST `/transactions`
   - DELETE `/transactions/{id}`

4. **InvestmentService** (如果存在)
   - GET `/investments`
   - POST `/investments`

## 🚀 使用方法

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 安装Angular Material（如果需要）

```bash
ng add @angular/material
# 选择主题: Custom
# Typography: Yes
# 动画: Yes
```

### 3. 启动开发服务器

```bash
ng serve
```

应用将运行在 `http://localhost:4200`

### 4. 构建生产版本

```bash
ng build --configuration production
```

## 📋 关键文件说明

### 核心文件

1. **app.module.ts** - 主模块配置
   - 导入所有Angular Material模块
   - 配置HTTP拦截器
   - 声明所有组件

2. **app-routing.module.ts** - 路由配置
   - 配置所有页面路由
   - 设置路由守卫
   - 重定向规则

3. **styles.scss** - 全局样式
   - 黄色主题配置
   - Material Design覆盖
   - 通用工具类

### 认证相关

1. **AuthService** - 认证服务
   - 处理登录/注册
   - Token管理
   - 用户状态管理

2. **AuthGuard** - 路由守卫
   - 保护需要登录的页面
   - 自动重定向到登录页

3. **AuthInterceptor** - HTTP拦截器
   - 自动添加JWT token到请求头
   - 格式: `Authorization: Bearer <token>`

4. **ErrorInterceptor** - 错误拦截器
   - 处理401错误（自动登出）
   - 处理其他HTTP错误

### 功能组件

每个功能模块都包含：
- `*.component.ts` - 组件逻辑
- `*.component.html` - 模板
- `*.component.scss` - 样式

## 🎨 设计系统

### 颜色方案
- **主色**: #F5D547 (黄色)
- **成功**: #4CAF50 (绿色)
- **警告**: #FF9800 (橙色)
- **错误**: #F44336 (红色)
- **信息**: #2196F3 (蓝色)

### 布局
- 卡片式设计
- 16px圆角
- 阴影: `0 2px 8px rgba(0,0,0,0.05)`
- 响应式断点: 768px

## 🔐 认证流程

### 注册流程
1. 用户填写注册表单
2. 发送POST到 `/api/v1/auth/register`
3. 后端返回 `{token, user}`
4. 前端保存token到localStorage
5. 更新currentUser状态
6. 重定向到dashboard

### 登录流程
1. 用户填写登录表单
2. 发送POST到 `/api/v1/auth/login`
3. 后端返回 `{token, user}`
4. 前端保存token到localStorage
5. 更新currentUser状态
6. 重定向到dashboard

### Token使用
- 存储: `localStorage.setItem('token', token)`
- 自动添加: AuthInterceptor自动添加到所有请求
- 格式: `Authorization: Bearer eyJhbGc...`

### 登出流程
1. 调用 `AuthService.logout()`
2. 清除localStorage
3. 清空currentUser状态
4. 重定向到登录页

## 📱 路由结构

```
/ → /dashboard (自动重定向)
/auth
  ├── /login (公开)
  └── /register (公开)
/dashboard (需要认证)
/transactions (需要认证)
  ├── /add
  └── /calendar
/analytics (需要认证)
/investments (需要认证)
  ├── /portfolio
  ├── /net-worth
  └── /accounts
/categories (需要认证)
/profile (需要认证)
```

## 🔌 HTTP拦截器

### AuthInterceptor
```typescript
// 自动添加token到每个请求
intercept(request, next) {
  const token = localStorage.getItem('token');
  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next.handle(request);
}
```

### ErrorInterceptor
```typescript
// 处理401错误自动登出
intercept(request, next) {
  return next.handle(request).pipe(
    catchError(error => {
      if (error.status === 401) {
        this.authService.logout();
      }
      return throwError(() => error);
    })
  );
}
```

## 🐛 常见问题

### 1. CORS错误
**问题**: `Access-Control-Allow-Origin` 错误
**解决**: 确保后端CORS配置允许 `http://localhost:4200`

### 2. 401错误
**问题**: API返回401 Unauthorized
**解决**: 
- 检查token是否正确保存
- 检查AuthInterceptor是否正常工作
- 检查后端JWT验证

### 3. 页面空白
**问题**: 页面显示空白
**解决**:
- 检查浏览器控制台错误
- 确保后端API正常运行
- 检查API返回数据格式

### 4. 样式不正确
**问题**: Material样式未加载
**解决**:
```bash
ng add @angular/material
# 或手动添加
npm install @angular/material @angular/cdk
```

## ✅ 测试检查清单

- [ ] 前端启动成功 (`ng serve`)
- [ ] 能访问登录页面
- [ ] 能成功注册新用户
- [ ] 能成功登录
- [ ] 登录后能看到dashboard
- [ ] Token自动添加到请求头
- [ ] 未登录访问受保护页面会重定向
- [ ] 登出功能正常
- [ ] 所有API调用正常
- [ ] 控制台无错误

## 📦 项目依赖

### 核心依赖
```json
{
  "@angular/animations": "^17.0.0",
  "@angular/cdk": "^17.0.0",
  "@angular/common": "^17.0.0",
  "@angular/core": "^17.0.0",
  "@angular/forms": "^17.0.0",
  "@angular/material": "^17.0.0",
  "@angular/platform-browser": "^17.0.0",
  "@angular/router": "^17.0.0",
  "rxjs": "^7.8.0",
  "tslib": "^2.6.0",
  "zone.js": "^0.14.0"
}
```

## 🚀 完整启动流程

```bash
# 1. 确保后端运行
cd backend
mvn spring-boot:run
# 等待后端启动完成

# 2. 新终端启动前端
cd frontend
npm install
ng serve

# 3. 浏览器访问
http://localhost:4200

# 4. 测试流程
# - 访问注册页面 → 注册新用户
# - 自动跳转到dashboard
# - 测试各个功能页面
# - 检查数据加载正常
```

## 📊 与后端API配对

这个前端项目完美配对您修复后的backend，所有API端点都已正确配置：

| 前端功能 | API端点 | 说明 |
|---------|---------|------|
| 注册 | POST /auth/register | 用户注册 |
| 登录 | POST /auth/login | 用户登录 |
| 获取用户信息 | GET /auth/me | 当前用户信息 |
| 数据分析 | GET /analytics/income-expense | 收入支出分析 |
| 交易列表 | GET /transactions | 获取交易记录 |
| 投资组合 | GET /investments | 获取投资列表 |
| 净资产 | GET /networth | 净资产计算 |

---

**版本**: 1.0.0
**最后更新**: 2025-12-31
**兼容Backend**: 1.0.0-FIXED
