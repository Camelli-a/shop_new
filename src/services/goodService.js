import { apiRequest } from './apiClient';

class GoodService {
  getGoodList() {
    return apiRequest('/api/products');
  }

  getGoodPage({ page = 1, pageSize = 8, keyword = '', categoryId = 'all' } = {}) {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });

    if (keyword) params.set('keyword', keyword);
    if (categoryId && categoryId !== 'all') params.set('categoryId', categoryId);

    return apiRequest(`/api/products?${params}`);
  }

  getGoodById(id) {
    return apiRequest(`/api/products/${id}`);
  }
}

const goodService = new GoodService();
export default goodService;
