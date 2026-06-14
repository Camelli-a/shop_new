# 第四次作业报告

**姓名：** 马辰宇  
**学号：** ___  
**作业名称：** React 商城系统

---

## 1. 组员分工

> 由组长填写，列出每位成员的具体产出与贡献占比。贡献占比总和应为 100%。

| 姓名 | 学号 | 分工与产出 | 贡献占比 |
|------|------|-----------|---------|
| ___（组长） | ___ | ___ | ___% |
| 李瑞泽 | 23301069 | 前台登录、我的页面、个人信息、退出登录、我的订单入口、登录拦截的编码；负责模块的单元测试、文档撰写和PPT制作 | 20% |
| ___ | ___ | ___ | ___% |
| ___ | ___ | ___ | ___% |

**分工说明（参考分类）：** 产品设计、UI 设计、前台编码、后台编码、PPT 制作、测试、文档撰写等。  
**注意：** 非编码工作（产品设计、PPT、文档等）同样计入贡献。

---

## 2. 项目结构

请说明你的项目结构与组件拆分方式：

```
App（根组件，含 <Outlet /> 渲染子路由）
├── HomePage              ← 商城主页面（搜索框、轮播图、热门商品）
├── LoginPage             ← 用户登录页
├── RegisterPage          ← 用户注册页
├── DetailPage            ← 商品详情页
├── CreateOrderPage       ← 创建订单页
├── PayPage               ← 支付页面
├── OrderListPage         ← 订单列表页
├── OrderDetailPage       ← 订单详情页
├── CartPage              ← 购物车页面
├── ProfilePage           ← 用户个人中心
├── PersonalInfoPage      ← 个人信息页面
├── AdminLoginPage        ← 后台登录页
├── AdminLayout           ← 后台布局组件
├── AdminHomePage         ← 后台首页/仪表盘
├── ProductManagement     ← 商品管理页
├── CategoryManagement    ← 分类管理页
├── OrderManagement       ← 订单管理页
├── UserManagement        ← 用户管理页
├── RoleManagement        ← 角色管理页
├── ForbiddenPage         ← 403 无权限访问页
└── ProtectedRoute        ← 路由守卫组件
```

各页面/组件职责说明：

| 页面/组件 | 职责 |
|-----------|------|
| App | 根组件，提供路由出口和全局 Context |
| HomePage | 商城首页，展示轮播图、商品分类、热门商品、搜索功能 |
| LoginPage | 用户登录页面，表单验证与登录逻辑 |
| RegisterPage | 用户注册页面，表单验证与注册逻辑 |
| DetailPage | 商品详情展示，查看商品信息、规格、添加购物车 |
| CreateOrderPage | 创建订单页面，填写收货地址、提交订单 |
| PayPage | 支付页面，模拟支付流程 |
| OrderListPage | 订单列表，按状态筛选查看订单 |
| OrderDetailPage | 订单详情页，查看订单详情和物流信息 |
| CartPage | 购物车页面，管理购物车商品、增减数量、结算 |
| ProfilePage | 个人主页展示、我的订单入口、个人信息入口和退出登录 |
| PersonalInfoPage | 昵称编辑、校验、调用接口更新用户资料 |
| AdminLoginPage | 后台管理员登录 |
| AdminLayout | 后台管理布局，包含侧边栏导航 |
| AdminHomePage | 后台首页/仪表盘，展示统计数据和最近订单 |
| ProductManagement | 商品管理，增删改查商品、上架下架 |
| CategoryManagement | 分类管理，管理商品分类、拖拽上传图片 |
| OrderManagement | 订单管理，查看订单、更新订单状态 |
| UserManagement | 用户管理，管理用户账号、分配角色 |
| RoleManagement | 角色管理，管理系统角色和权限，修改权限后自动刷新当前用户权限 |
| ForbiddenPage | 403 无权限访问页面，提示用户权限不足，提供返回首页和重新登录功能 |
| ProtectedRoute | 路由守卫，保护需要登录的页面 |

## 3. 前台功能实现说明

| 功能模块 | 实现方式 |
|----------|----------|
| 商城主页面（搜索框/轮播图/热门商品） | ___ |
| 商品详情页 | ___ |
| 购物车 | ___ |
| 创建订单 | ___ |
| 支付页面 | ___ |
| 订单列表 | ___ |
| 订单详情 | ___ |
| 用户登录/注册 | ___ |
| 个人主页 | ___ |

## 4. 后台管理端功能实现说明

> 商品管理、分类管理、订单管理中至少完成一个完整的管理功能。

| 功能模块 | 实现方式 |
|----------|----------|
| 后台登录 | 独立登录页面，管理员登录后保存 token 到 localStorage，路由守卫保护后台页面，登录接口返回用户权限列表和角色名称 |
| 权限管理 | 基于角色的权限控制，角色有 admin1（超级管理员）、admin2（商品管理员）、admin3（订单管理员），超级管理员不可删除，权限包含首页、商品、分类、订单、用户、角色管理，修改角色权限后自动刷新当前登录用户权限 |
| 商品管理 | 完整的 CRUD 功能，支持分页、搜索、分类筛选、添加/编辑/删除商品、上架/下架 |
| 分类管理 | 分类增删改查，支持拖拽上传图片，查看分类下商品数量 |
| 订单管理 | 查看所有订单、按状态筛选、查看订单详情、更新订单状态（发货、完成等） |
| 用户管理 | 用户列表、添加用户、编辑用户信息、分配角色、启用/禁用用户、删除用户（超级管理员不可删除） |
| 角色管理 | 角色列表、添加角色、编辑角色名称和描述、配置角色权限、删除角色（超级管理员角色不可删除），修改权限后自动刷新当前登录用户权限 |
| 仪表盘 | 数据统计卡片（用户数、订单数、商品数）、总收入统计、最近订单列表 |
| 权限刷新 | 页面加载时自动刷新用户权限，确保使用最新配置的权限 |
| 403 页面 | 无权限访问时显示美观的 403 页面，提供返回首页和重新登录功能 |

## 5. 路由设计

请说明前台与后台的路由规划：

```jsx
const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      { path: "/", Component: HomePage },
      { path: "/login", Component: LoginPage },
      { path: "/register", Component: RegisterPage },
      { path: "/home", Component: HomePage },
      { path: "/category", Component: CategoryPage },
      { path: "/detail/:goodId", Component: DetailPage },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/cart", Component: CartPage },
          { path: "/profile", Component: ProfilePage },
          { path: "/profile/info", Component: PersonalInfoPage },
          { path: "/createOrder", Component: CreateOrderPage },
          { path: "/createOrder/:goodId", Component: CreateOrderPage },
          { path: "/orderList", Component: OrderListPage },
          { path: "/orderDetail/:orderId", Component: OrderDetailPage },
          { path: "/pay/:orderId", Component: PayPage },
        ]
      },
    ]
  },
  { path: "/admin/login", Component: AdminLoginPage },
  {
    path: "/admin",
    element: <AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>,
    children: [
      { path: "", element: <Navigate to="/admin/home" replace /> },
      { path: "home", Component: AdminHomePage },
      { path: "products", Component: ProductManagement },
      { path: "categories", Component: CategoryManagement },
      { path: "orders", Component: OrderManagement },
      { path: "users", Component: UserManagement },
      { path: "roles", Component: RoleManagement },
    ],
  },
]);
```

## 6. 状态管理与数据存储

请说明全局状态的管理方式（Context / Redux 等）以及数据持久化方案：

- **全局状态管理方式：** ___（如 Context + Service 模式）
- **数据存储方式：** ___（如 localStorage / Mock.js / 后端 API）
- **前后台数据联动方式：** ___

## 7. 加分项完成情况

- [x] **后端联动**：完整接入后端 API，包括用户认证、商品、分类、购物车、订单、后台管理等所有接口
- [x] **数据持久化**：刷新页面后购物车/登录状态不丢失，使用 localStorage 保存用户 token 和购物车数据
- [x] **表单验证**：登录/注册表单验证（用户名、密码长度、确认密码），后台编辑表单验证（必填项、长度限制）
- [x] **分页/无限滚动**：后台管理页面实现分页功能，支持自定义页大小
- [x] **支付模拟优化**：支付页面显示支付倒计时和二维码
- [x] **响应式布局**：使用 CSS Grid 和 Flex 布局，适配不同屏幕
- [x] **性能优化**：使用 useCallback 和 useMemo 优化组件渲染，避免不必要的重渲染
- [x] **单元测试**：使用 Vitest 编写单元测试，覆盖后台 API、数据存储、组件测试，共 60+ 测试用例
- [ ] **部署上线**：___（提供可访问链接）

## 8. 遇到的问题与解决方案

| 问题 | 解决方案 |
|------|----------|
| 测试文件中 React 未定义错误 | 在所有 .test.jsx 文件顶部添加 `import React from 'react';` |
| 后台测试中 jest 未定义 | 项目使用 Vitest，将 jest 相关 API 替换为 vi（如 vi.fn()、vi.resetModules()） |
| 昵称长度验证测试失败 | 修改测试用例，使用明确超过 20 字符的字符串，确保验证逻辑正确触发 |
| 数据存储测试中的模块缓存问题 | 避免动态导入模块，直接在测试中实现相关函数进行测试 |
| 分类图片上传功能 | 实现拖拽上传区域，使用 FileReader 读取图片为 base64，无需额外后端依赖 |
| 超级管理员删除保护 | 在前端和后端同时添加判断，阻止删除 id 为 1 的角色和 role 为 'admin' 的用户 |

## 9. 后台技术实现补充

### 后端架构

- **技术栈**：Node.js + Express
- **数据存储**：JSON 文件 (server/data/db.json)，使用自定义 store 模块管理数据读写
- **测试框架**：Vitest + Supertest，测试覆盖 API 接口和数据存储模块

### 后台 API 接口

**认证接口**
- `POST /api/admin/login` - 管理员登录
- `POST /api/user/login` - 用户登录
- `POST /api/user/register` - 用户注册
- `POST /api/user/logout` - 用户退出

**商品接口**
- `GET /api/products` - 获取商品列表（支持分页、搜索、分类）
- `GET /api/products/:id` - 获取商品详情
- `GET /api/admin/products` - 后台商品列表
- `POST /api/admin/products` - 添加商品
- `PUT /api/admin/products/:id` - 更新商品
- `DELETE /api/admin/products/:id` - 删除商品

**分类接口**
- `GET /api/categories` - 获取分类列表
- `GET /api/admin/categories` - 后台分类列表
- `POST /api/admin/categories` - 添加分类
- `PUT /api/admin/categories/:id` - 更新分类
- `DELETE /api/admin/categories/:id` - 删除分类（有商品时不可删除）

**购物车接口**
- `GET /api/users/:userId/cart` - 获取购物车
- `POST /api/users/:userId/cart` - 添加商品到购物车
- `PUT /api/users/:userId/cart/:cartKey` - 更新购物车项
- `DELETE /api/users/:userId/cart/:cartKey` - 删除购物车项
- `POST /api/users/:userId/cart/remove-batch` - 批量删除

**订单接口**
- `POST /api/users/:userId/orders` - 创建订单
- `PUT /api/orders/:id/pay` - 支付订单
- `GET /api/users/:userId/orders` - 获取用户订单
- `GET /api/user/orders` - 获取我的订单
- `GET /api/user/orders/:id` - 获取我的订单详情
- `GET /api/admin/orders` - 后台订单列表
- `GET /api/admin/orders/:id` - 后台订单详情
- `PUT /api/admin/orders/:id/status` - 更新订单状态

**用户管理接口**
- `GET /api/user/profile` - 获取个人信息
- `PUT /api/user/profile` - 更新个人信息
- `GET /api/admin/users` - 用户列表
- `POST /api/admin/users` - 添加用户
- `PUT /api/admin/users/:id` - 更新用户
- `DELETE /api/admin/users/:id` - 删除用户

**角色管理接口**
- `GET /api/admin/roles` - 角色列表
- `POST /api/admin/roles` - 添加角色
- `PUT /api/admin/roles/:id` - 更新角色
- `DELETE /api/admin/roles/:id` - 删除角色

**仪表盘接口**
- `GET /api/admin/dashboard` - 获取统计数据

### 测试覆盖

- **后台 API 测试**：32 个测试用例，覆盖所有后台接口
- **数据存储测试**：7 个测试用例，验证数据库读写、种子数据创建
- **用户 API 测试**：21 个测试用例，覆盖用户认证和个人信息操作
- 总计：60+ 测试用例全部通过

---

## 9. 权限管理系统

### 角色与权限

系统预设三个角色，每个角色拥有不同的后台管理权限：

| 角色 | 用户名/密码 | 权限说明 |
|------|-------------|---------|
| **超级管理员** | admin1 / 123456 | dashboard, goods, categories, orders, users, roles（全部权限） |
| **商品管理员** | admin2 / 123456 | dashboard, goods, categories（商品和分类管理） |
| **订单管理员** | admin3 / 123456 | dashboard, orders, users（订单和用户查看） |

### 权限实现

1. **后端权限验证**：
   - 登录时根据用户的 `role` 字段匹配对应角色
   - 返回用户权限列表 `permissions` 给前端

2. **前端权限控制**：
   - `AuthAdminContext`：管理登录状态和用户权限
   - `PermissionGuard`：路由级权限守卫，无权限显示 403 页面
   - 菜单动态显示：只显示用户有权限访问的菜单项

3. **权限映射**：
   | 菜单 | 权限 Key |
   |------|---------|
   | 首页/仪表盘 | dashboard |
   | 商品管理 | goods |
   | 分类管理 | categories |
   | 订单管理 | orders |
   | 用户管理 | users |
   | 角色管理 | roles |

### 功能特性

- **登录页面**：显示三个测试账号，方便测试不同角色权限
- **用户信息显示**：顶部显示当前用户姓名和角色名称
- **权限守卫**：直接输入无权限的 URL 会跳转到 403 提示页面
- **超级管理员保护**：超级管理员账号和角色不可删除
