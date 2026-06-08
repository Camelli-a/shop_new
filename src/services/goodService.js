import { STORAGE_KEYS } from '../constants/storageKeys';
import { legacyGoodNames, mockGoods } from '../mocks';

const cloneGoods = () => mockGoods.map(item => ({ ...item }));

class GoodService {
  list = [];

  constructor() {
    this._loadData();
  }

  // 根据 id 获取单个商品
  getGoodById(id) {
    return this.list.find(item => item.id === id);
  }

  // 获取商品列表
  getGoodList() {
    return this.list;
  }

  // 添加商品，供后续后台商品管理复用
  addGood(good) {
    this.list.push(good);
    this._saveData();
  }

  // 删除商品
  deleteGood(id) {
    this.list = this.list.filter(item => item.id !== id);
    this._saveData();
  }

  // 更新商品
  updateGood(good) {
    this.list = this.list.map(item => {
      if (item.id === good.id) {
        return good;
      }
      return item;
    });
    this._saveData();
  }

  _saveData() {
    localStorage.setItem(STORAGE_KEYS.goods, JSON.stringify(this.list));
  }

  _loadData() {
    const list = localStorage.getItem(STORAGE_KEYS.goods);
    if (!list) {
      this._resetToMockData();
      return;
    }

    try {
      const parsedList = JSON.parse(list);
      if (this._isLegacyDemoData(parsedList)) {
        this._resetToMockData();
        return;
      }
      // 若缓存条数少于最新 mock 数据，说明 mock 有新增，重置以补充新商品
      if (!Array.isArray(parsedList) || parsedList.length < mockGoods.length) {
        this._resetToMockData();
        return;
      }
      this.list = parsedList;
    } catch {
      this._resetToMockData();
    }
  }

  _resetToMockData() {
    this.list = cloneGoods();
    this._saveData();
  }

  _isLegacyDemoData(list) {
    return Array.isArray(list)
      && (
        (
          list.length <= 3
          && list.every(item => /^商品\d+$/.test(item.name || ''))
        )
        || (
          list.length <= legacyGoodNames.length
          && list.every(item => legacyGoodNames.includes(item.name || ''))
        )
      );
  }
}

const goodService = new GoodService();
export default goodService;
