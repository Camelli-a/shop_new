import { STORAGE_KEYS } from '../constants/storageKeys';

const cloneItem = item => ({ ...item });

class CartService {
  list = [];

  constructor() {
    this._loadData();
  }

  getCartList() {
    return this.list.map(cloneItem);
  }

  addItem(item) {
    const sku = item.sku || '默认规格';
    const cartKey = item.cartKey || `${item.id}-${sku}`;
    const quantity = Math.max(1, Number(item.quantity ?? item.count ?? 1));
    const existing = this.list.find(cartItem => cartItem.cartKey === cartKey);

    if (existing) {
      existing.quantity += quantity;
      existing.count = existing.quantity;
      existing.selected = true;
    } else {
      this.list.push({
        ...item,
        cartKey,
        sku,
        quantity,
        count: quantity,
        selected: item.selected !== false,
      });
    }

    this._saveData();
    return this.getCartList();
  }

  updateQuantity(cartKey, quantity) {
    const item = this.list.find(cartItem => cartItem.cartKey === cartKey);
    if (!item) return false;

    item.quantity = Math.max(1, Number(quantity) || 1);
    item.count = item.quantity;
    this._saveData();
    return true;
  }

  removeItem(cartKey) {
    const nextList = this.list.filter(item => item.cartKey !== cartKey);
    if (nextList.length === this.list.length) return false;

    this.list = nextList;
    this._saveData();
    return true;
  }

  removeItems(cartKeys) {
    const keySet = new Set(cartKeys);
    this.list = this.list.filter(item => !keySet.has(item.cartKey));
    this._saveData();
  }

  setSelected(cartKey, selected) {
    const item = this.list.find(cartItem => cartItem.cartKey === cartKey);
    if (!item) return false;

    item.selected = Boolean(selected);
    this._saveData();
    return true;
  }

  setAllSelected(selected) {
    this.list.forEach(item => {
      item.selected = Boolean(selected);
    });
    this._saveData();
  }

  getSelectedItems() {
    return this.list.filter(item => item.selected).map(cloneItem);
  }

  getCartCount() {
    return this.list.reduce((total, item) => total + item.quantity, 0);
  }

  _loadData() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.cart);
      const parsed = data ? JSON.parse(data) : [];
      this.list = Array.isArray(parsed)
        ? parsed.map(item => {
          const sku = item.sku || '默认规格';
          const quantity = Math.max(1, Number(item.quantity ?? item.count ?? 1));
          return {
            ...item,
            cartKey: item.cartKey || `${item.id}-${sku}`,
            sku,
            quantity,
            count: quantity,
            selected: item.selected !== false,
          };
        })
        : [];
    } catch {
      this.list = [];
    }
    this._saveData();
  }

  _saveData() {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(this.list));
  }
}

const cartService = new CartService();
export default cartService;
