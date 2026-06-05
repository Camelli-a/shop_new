const asset = path => `/assets/home/${path}`;

export const topChannels = [
  { key: 'deal', label: '特价' },
  { key: 'all', label: '推荐' },
  { key: 'flash', label: '闪购' },
  { key: 'campus', label: '校园团' },
  { key: 'digital', label: '数码' },
  { key: 'food', label: '零食' },
  { key: 'life', label: '日用' },
];

export const categoryList = [
  { key: 'all', label: '推荐', iconSrc: asset('icons/recommend.svg'), tone: 'tao-red' },
  { key: 'digital', label: '数码', iconSrc: asset('icons/digital.svg'), tone: 'tao-orange' },
  { key: 'food', label: '零食', iconSrc: asset('icons/snacks.svg'), tone: 'tao-pink' },
  { key: 'life', label: '日用', iconSrc: asset('icons/daily.svg'), tone: 'tao-gold' },
  { key: 'study', label: '学习', iconSrc: asset('icons/study.svg'), tone: 'tao-blue' },
  { key: 'sport', label: '运动', iconSrc: asset('icons/sport.svg'), tone: 'tao-green' },
  { key: 'fashion', label: '穿搭', iconSrc: asset('icons/fashion.svg'), tone: 'tao-rose' },
  { key: 'shop', label: '店铺', iconSrc: asset('icons/shop.svg'), tone: 'tao-red' },
  { key: 'coupon', label: '领券', iconSrc: asset('icons/coupon.svg'), tone: 'tao-orange' },
  { key: 'nearby', label: '校园', iconSrc: asset('icons/campus.svg'), tone: 'tao-green' },
];

export const bannerList = [
  {
    theme: 'campus',
    label: '新人补贴',
    title: '开学装备今日直降',
    desc: '宿舍囤货 / 学习数码 / 低卡零食',
    badge: '满99减20',
    action: '进会场',
    image: asset('banners/campus-sale.svg'),
    products: [
      { image: asset('jd-11.png'), name: 'iPhone', price: '¥5269' },
      { image: asset('jd-02.png'), name: '电竞主机', price: '¥5299' },
    ],
  },
  {
    theme: 'digital',
    label: '数码低价',
    title: '蓝牙键盘限时秒杀',
    desc: '学生价到手更省，今晚 22:00 截止',
    badge: '¥129起',
    action: '立即抢',
    image: asset('banners/digital-deal.svg'),
    products: [
      { image: asset('jd-02.png'), name: 'ROG 主机', price: '¥5299' },
      { image: asset('jd-03.png'), name: '罗技鼠标', price: '¥665' },
    ],
  },
  {
    theme: 'snack',
    label: '夜自习补给',
    title: '低卡零食第二件半价',
    desc: '燕麦拿铁 / 坚果礼盒 / 能量小食',
    badge: '2件5折',
    action: '领券买',
    image: asset('banners/snack-night.svg'),
    products: [
      { image: asset('jd-10.png'), name: '护肤礼盒', price: '2件5折' },
      { image: asset('jd-06.png'), name: '潮玩挂件', price: '¥39.9' },
    ],
  },
];

export const promoDockList = [
  { key: 'deal', label: '国家补贴', desc: '数码低至 8 折', tone: 'red' },
  { key: 'flash', label: '限时秒杀', desc: '09:38:50', tone: 'orange' },
  { key: 'coupon', label: '新人券包', desc: '满99减20', tone: 'cream' },
];

export const productImageMap = {
  1: asset('jd-01.png'),
  2: asset('jd-02.png'),
  3: asset('jd-03.png'),
  4: asset('jd-04.png'),
  5: asset('jd-05.png'),
  6: asset('jd-06.png'),
  7: asset('jd-07.png'),
  8: asset('jd-08.png'),
  9: asset('jd-09.png'),
  10: asset('jd-10.png'),
  11: asset('jd-11.png'),
};

export const bottomTabs = [
  { key: 'home', label: '首页', icon: 'home' },
  { key: 'category', label: '分类', icon: 'category' },
  { key: 'cart', label: '购物车', icon: 'cart' },
  { key: 'profile', label: '我的', icon: 'profile' },
];
