import { useEffect, useState } from 'react';
import './ProductManagement.css';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ keyword: '', categoryId: '' });
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    originalPrice: '',
    stock: '',
    img: '',
    description: '',
    status: 1
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [pagination.page, pagination.pageSize, filters]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/categories');
      const result = await response.json();
      if (result.code === 200) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error('获取分类失败', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...filters
      });
      const response = await fetch(`http://localhost:5000/api/admin/products?${params}`);
      const result = await response.json();
      if (result.code === 200) {
        setProducts(result.data.list);
        setPagination(prev => ({ ...prev, total: result.data.total }));
      }
    } catch (err) {
      console.error('获取商品失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingProduct
        ? `http://localhost:5000/api/admin/products/${editingProduct.id}`
        : 'http://localhost:5000/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      if (result.code === 200) {
        setShowModal(false);
        resetForm();
        fetchProducts();
      }
    } catch (err) {
      console.error('操作失败', err);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/products/${deleteConfirm.id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.code === 200) {
        setDeleteConfirm(null);
        fetchProducts();
      }
    } catch (err) {
      console.error('删除失败', err);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      categoryId: '',
      price: '',
      originalPrice: '',
      stock: '',
      img: '',
      description: '',
      status: 1
    });
  };

  const getStatusText = (status) => status === 1 ? '在售' : '下架';
  const getStatusClass = (status) => status === 1 ? 'status-active' : 'status-inactive';

  return (
    <div className="product-management">
      <div className="page-header">
        <div className="filter-bar">
          <input
            type="text"
            placeholder="搜索商品名称"
            value={filters.keyword}
            onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
            className="search-input"
          />
          <select
            value={filters.categoryId}
            onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
            className="filter-select"
          >
            <option value="">全部分类</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={fetchProducts}>
            搜索
          </button>
        </div>
        <button
          className="btn btn-success"
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          添加商品
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>加载中...</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>商品图片</th>
                <th>商品名称</th>
                <th>分类</th>
                <th>价格</th>
                <th>原价</th>
                <th>库存</th>
                <th>销量</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>
                    <img src={product.img} alt={product.name} className="product-img" />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.categoryName}</td>
                  <td>¥{product.price}</td>
                  <td>¥{product.originalPrice}</td>
                  <td>{product.stock}</td>
                  <td>{product.sales}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(product.status)}`}>
                      {getStatusText(product.status)}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-primary btn-small" onClick={() => handleEdit(product)}>
                      编辑
                    </button>
                    <button className="btn btn-danger btn-small" onClick={() => setDeleteConfirm(product)}>
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="pagination">
        <span>共 {pagination.total} 条记录</span>
        <button
          disabled={pagination.page === 1}
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
        >
          上一页
        </button>
        <span>第 {pagination.page} 页 / 共 {Math.ceil(pagination.total / pagination.pageSize)} 页</span>
        <button
          disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
        >
          下一页
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingProduct ? '编辑商品' : '添加商品'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>商品名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>分类</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  required
                >
                  <option value="">请选择</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>价格</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>原价</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>库存</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>状态</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: parseInt(e.target.value) }))}
                  >
                    <option value={1}>在售</option>
                    <option value={0}>下架</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>商品图片</label>
                <input
                  type="text"
                  value={formData.img}
                  onChange={(e) => setFormData(prev => ({ ...prev, img: e.target.value }))}
                  placeholder="图片URL"
                />
              </div>
              <div className="form-group">
                <label>商品描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-default" onClick={() => setShowModal(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal confirm-modal">
            <div className="confirm-icon">⚠️</div>
            <p>确定要删除这个商品吗？</p>
            <div className="confirm-buttons">
              <button className="btn btn-default" onClick={() => setDeleteConfirm(null)}>
                取消
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductManagement;
