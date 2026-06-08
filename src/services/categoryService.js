import { apiRequest } from './apiClient';

class CategoryService {
  getCategoryList() {
    return apiRequest('/api/categories');
  }
}

const categoryService = new CategoryService();
export default categoryService;
