import { useCallback, useEffect, useState } from 'react';
import './CategoryManagement.css';

function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    sort: '',
    status: 1
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/categories');
      const result = await response.json();
      if (result.code === 200) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error('获取分类失败', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchCategories);
  }, [fetchCategories]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({
        ...prev,
        icon: e.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingCategory
        ? `http://localhost:5000/api/admin/categories/${editingCategory.id}`
        : 'http://localhost:5000/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      if (result.code === 200) {
        setShowModal(false);
        resetForm();
        fetchCategories();
      }
    } catch (err) {
      console.error('操作失败', err);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData(category);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/categories/${deleteConfirm.id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.code === 200) {
        setDeleteConfirm(null);
        fetchCategories();
      }
    } catch (err) {
      console.error('删除失败', err);
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      icon: '',
      sort: '',
      status: 1
    });
  };

  const getStatusText = (status) => status === 1 ? '启用' : '禁用';
  const getStatusClass = (status) => status === 1 ? 'status-active' : 'status-inactive';

  return (
    <div className="category-management">
      <div className="page-header">
        <h2>分类管理</h2>
        <button
          className="btn btn-success"
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          添加分类
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
                <th>图标</th>
                <th>分类名称</th>
                <th>排序</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>
                    <img src={category.icon} alt={category.name} className="category-icon" />
                  </td>
                  <td>{category.name}</td>
                  <td>{category.sort}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(category.status)}`}>
                      {getStatusText(category.status)}
                    </span>
                  </td>
                  <td>{category.createTime?.split('T')[0] || category.createTime}</td>
                  <td>
                    <button className="btn btn-primary btn-small" onClick={() => handleEdit(category)}>
                      编辑
                    </button>
                    <button className="btn btn-danger btn-small" onClick={() => setDeleteConfirm(category)}>
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingCategory ? '编辑分类' : '添加分类'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>分类名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>图标</label>
                <div 
                  className={`upload-area ${dragOver ? 'drag-over' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input').click()}
                >
                  {formData.icon ? (
                    <div className="upload-preview">
                      <img src={formData.icon} alt="Preview" className="preview-image" />
                      <div className="preview-overlay">
                        <span>点击或拖拽更换图片</span>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <div className="upload-icon">📷</div>
                      <p>点击或拖拽图片到此处上传</p>
                      <p className="upload-hint">支持 JPG、PNG、GIF 格式</p>
                    </div>
                  )}
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                  />
                </div>
                <div className="form-url-input">
                  <span>或输入URL：</span>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="图标URL"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>排序</label>
                <input
                  type="number"
                  value={formData.sort}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>状态</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: parseInt(e.target.value) }))}
                >
                  <option value={1}>启用</option>
                  <option value={0}>禁用</option>
                </select>
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
            <p>确定要删除这个分类吗？</p>
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

export default CategoryManagement;
