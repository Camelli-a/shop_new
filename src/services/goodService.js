import { apiRequest } from './apiClient';

class GoodService {
  getGoodList() {
    return apiRequest('/api/products');
  }

  getGoodById(id) {
    return apiRequest(`/api/products/${id}`);
  }
}

const goodService = new GoodService();
export default goodService;
