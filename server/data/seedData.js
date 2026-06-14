const categories = [
  { id: 'digital', name: '数码好物', icon: '/assets/home/icons/digital.svg', sort: 1, status: 1 },
  { id: 'study', name: '学习办公', icon: '/assets/home/icons/study.svg', sort: 2, status: 1 },
  { id: 'fashion', name: '服饰配件', icon: '/assets/home/icons/fashion.svg', sort: 3, status: 1 },
  { id: 'food', name: '食品零食', icon: '/assets/home/icons/snacks.svg', sort: 4, status: 1 },
  { id: 'life', name: '生活日用', icon: '/assets/home/icons/daily.svg', sort: 5, status: 1 },
  { id: 'sport', name: '运动户外', icon: '/assets/home/icons/sport.svg', sort: 6, status: 1 },
];

const productSeeds = [
  [1, 'ASUS Ascent GX10 AI迷你高性能计算机', 665.1, 'digital', '/assets/home/jd-01.png', '自营', 3360000, 4.9],
  [2, '华硕 ROG RTX5070 电竞主机整机', 5299, 'digital', '/assets/home/jd-02.png', '补贴', 182000, 4.8],
  [3, '罗技 G 系列联名无线鼠标', 665.1, 'digital', '/assets/home/jd-03.png', '热销', 1520000, 4.7],
  [4, 'Apple Watch 黑色运动款智能手表', 1299, 'digital', '/assets/home/jd-04.png', '新品', 98000, 4.9],
  [5, 'MECH Guardian 智能机器狗编程玩具', 299, 'study', '/assets/home/jd-05.png', '科技', 24600, 4.8],
  [6, '宝可梦精灵球钥匙扣收纳包', 39.9, 'fashion', '/assets/home/jd-06.png', '潮玩', 128000, 4.9],
  [7, 'AirPods Pro 主动降噪无线耳机', 665.1, 'digital', '/assets/home/jd-07.png', '自营', 1520000, 4.8],
  [8, 'Apple Watch 深空黑运动表', 1599, 'digital', '/assets/home/jd-08.png', '低价', 76000, 4.8],
  [9, '从 RTL 级代码到 FPGA 加速大模型训练与推理', 78, 'study', '/assets/home/jd-09.png', '教材', 23000, 4.7],
  [10, 'OLAY 胜肽水乳面霜护肤礼盒', 218, 'life', '/assets/home/jd-10.png', '礼盒', 89000, 4.9],
  [11, 'Apple iPhone 17 Pro Max 京东全球购', 5269.01, 'digital', '/assets/home/jd-11.png', '国补', 3360000, 4.9],
  [12, '笋小样 网红竹笋零食礼包', 29.9, 'food', '/assets/home/jd-13.png', '热销', 256000, 4.8],
  [13, '威尔胜 Tour V 碳素网球拍', 388, 'sport', '/assets/home/jd-14.png', '新品', 43000, 4.7],
];

const categoryNameMap = Object.fromEntries(categories.map(item => [item.id, item.name]));
const now = new Date().toISOString();

const products = productSeeds.map(([id, name, price, categoryId, img, tag, sales, rating]) => ({
  id,
  name,
  price,
  originalPrice: Math.round(price * 1.28),
  categoryId,
  categoryName: categoryNameMap[categoryId],
  img,
  tag,
  sales,
  rating,
  stock: 500,
  description: '精选商城好物，兼顾价格、品质和日常使用体验。',
  status: 1,
  createTime: now,
  updateTime: now,
}));

const users = [
  {
    id: 1,
    username: 'admin1',
    password: '123456',
    role: 'admin1',
    name: '系统管理员',
    nickname: '京东用户',
    avatar: '/assets/home/icons/recommend.svg',
    email: 'admin@example.com',
    phone: '13800000000',
    createTime: now,
    status: 1,
  },
  {
    id: 2,
    username: 'admin2',
    password: '123456',
    role: 'admin2',
    name: '商品管理员',
    avatar: '/assets/home/icons/recommend.svg',
    email: 'manager@example.com',
    phone: '13800000001',
    createTime: now,
    status: 1,
  },
  {
    id: 3,
    username: 'admin3',
    password: '123456',
    role: 'admin3',
    name: '订单管理员',
    avatar: '/assets/home/icons/recommend.svg',
    email: 'user@example.com',
    phone: '13800000002',
    createTime: now,
    status: 1,
  },
];

const roles = [
  { id: 1, name: 'admin1', description: '全部后台权限', permissions: ['dashboard', 'goods', 'categories', 'orders', 'users', 'roles'], createTime: now },
  { id: 2, name: 'admin2', description: '商品与分类管理', permissions: ['dashboard', 'goods', 'categories'], createTime: now },
  { id: 3, name: 'admin3', description: '订单与用户查看', permissions: ['dashboard', 'orders', 'users'], createTime: now },
];

function createSeedData() {
  return {
    categories: categories.map(item => ({ ...item, createTime: now })),
    products,
    users,
    roles,
    carts: {},
    orders: [],
  };
}

module.exports = { createSeedData };
