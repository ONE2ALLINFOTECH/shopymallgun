import React, { useState, useEffect } from "react";
import axios from "axios";
import Dashboard from "../pages/Dashboard";
import "./SubcategoryPanel.css";

const SubcategoryForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    description: "",
    status: "active",
    isFeatured: false,
    sortOrder: "",
    metaTitle: "",
    metaDescription: "",
  });
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // New states for confirmation popups
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmButtonText, setConfirmButtonText] = useState("");
  const [confirmButtonClass, setConfirmButtonClass] = useState("");
  const [confirmIcon, setConfirmIcon] = useState("");

  // Success/Error notification states
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState(""); // success, error, warning

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/category");
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/subcategory");
      setSubcategories(res.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  // Enhanced notification system
  const showSuccessNotification = (message) => {
    setNotificationMessage(message);
    setNotificationType("success");
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const showErrorNotification = (message) => {
    setNotificationMessage(message);
    setNotificationType("error");
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  };

  // Generic confirmation popup
  const showConfirmation = (title, message, buttonText, buttonClass, icon, action) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmButtonText(buttonText);
    setConfirmButtonClass(buttonClass);
    setConfirmIcon(icon);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmModal(false);
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Subcategory name is required";
    }
    
    if (!formData.category) {
      newErrors.category = "Category selection is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      category: "",
      description: "",
      status: "active",
      isFeatured: false,
      sortOrder: "",
      metaTitle: "",
      metaDescription: "",
    });
    setImage(null);
    setImagePreview(null);
    setEditMode(false);
    setEditId(null);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Show confirmation before submitting
    const action = editMode ? "update" : "add";
    const actionText = editMode ? "Update" : "Add";
    
    showConfirmation(
      `${actionText} Subcategory`,
      `Are you sure you want to ${action} "${formData.name}" subcategory?`,
      `${actionText} Subcategory`,
      editMode ? "btn-update" : "btn-add",
      editMode ? "fas fa-edit" : "fas fa-plus",
      () => performSubmit()
    );
  };

  const performSubmit = async () => {
    setLoading(true);
    const data = new FormData();
    
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    
    if (image) {
      data.append("image", image);
    }

    try {
      if (editMode) {
        await axios.put(`http://localhost:5000/api/subcategory/${editId}`, data);
        showSuccessNotification("✅ Subcategory updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/subcategory", data);
        showSuccessNotification("✅ Subcategory added successfully!");
      }
      
      resetForm();
      setShowModal(false);
      fetchSubcategories();
    } catch (err) {
      console.error("Error saving subcategory:", err);
      showErrorNotification("❌ Error saving subcategory. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sub) => {
    // Show confirmation before editing
    showConfirmation(
      "Edit Subcategory",
      `Do you want to edit "${sub.name}" subcategory?`,
      "Edit Subcategory",
      "btn-edit",
      "fas fa-edit",
      () => performEdit(sub)
    );
  };

  const performEdit = (sub) => {
    setFormData({
      name: sub.name || "",
      slug: sub.slug || "",
      category: sub.category?._id || "",
      description: sub.description || "",
      status: sub.status || "active",
      isFeatured: sub.isFeatured || false,
      sortOrder: sub.sortOrder || "",
      metaTitle: sub.metaTitle || "",
      metaDescription: sub.metaDescription || "",
    });
    
    if (sub.image) {
      setImagePreview(sub.image);
    }
    
    setEditId(sub._id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    // Show confirmation before deleting
    showConfirmation(
      "Delete Subcategory",
      `Are you sure you want to delete "${name}" subcategory? This action cannot be undone.`,
      "Delete Subcategory",
      "btn-delete",
      "fas fa-trash-alt",
      () => performDelete(id)
    );
  };

  const performDelete = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/subcategory/${id}`);
      showSuccessNotification("✅ Subcategory deleted successfully!");
      fetchSubcategories();
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      showErrorNotification("❌ Error deleting subcategory. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <>
      <Dashboard />
      <div className="subcategory-container container">
        {/* Page Header */}
        <div className="page-header fade-in">
          <div>
          <h2 className="title mb-0">🗂️ Subcategory Management Dashboard</h2>
          
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons fade-in">
          <button className="btn-add-new" onClick={openAddModal}>
            <i className="fas fa-plus"></i>
            Add New Subcategory
          </button>
          <div className="table-stats">
            Total Subcategories: <strong>{subcategories.length}</strong>
          </div>
        </div>

        {/* Subcategories Table */}
        <div className="table-container fade-in">
          <div className="table-header">
            <h2 className="table-title">📋 All Subcategories</h2>
            <div className="table-stats">
              Active: {subcategories.filter(sub => sub.status === 'active').length} | 
              Featured: {subcategories.filter(sub => sub.isFeatured).length}
            </div>
          </div>
          
          <div className="table-responsive">
            {loading && (
              <div className="loading-overlay">
                <div className="spinner"></div>
              </div>
            )}
            
            <table className="custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>🖼️ Image</th>
                  <th>📝 Name</th>
                  <th>🔗 Slug</th>
                  <th>📂 Category</th>
                  <th>📊 Status</th>
                  <th>⭐ Featured</th>
                  <th>🔢 Sort</th>
                  <th>⚙️ Actions</th>
                </tr>
              </thead>
              <tbody>
                {subcategories.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="9">
                      <div className="empty-state">
                        <i className="fas fa-inbox"></i>
                        <h3>No Subcategories Found</h3>
                        <p>Click "Add New Subcategory" to create your first subcategory</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  subcategories.map((sub, index) => (
                    <tr key={sub._id}>
                      <td><strong>{index + 1}</strong></td>
                      <td>
                        {sub.image ? (
                          <img
                            src={sub.image}
                            alt={sub.name}
                            className="table-image"
                          />
                        ) : (
                          <div className="table-image" style={{
                            background: '#f8f9fa',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#6c757d',
                            fontSize: '1.5rem'
                          }}>
                            🖼️
                          </div>
                        )}
                      </td>
                      <td><strong>{sub.name}</strong></td>
                      <td>{sub.slug || "-"}</td>
                      <td>
                        <span style={{
                          background: 'rgba(102, 126, 234, 0.1)',
                          color: '#667eea',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}>
                          {sub.category?.name || "-"}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${sub.status}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td>
                        <span className={`featured-badge ${sub.isFeatured ? 'yes' : 'no'}`}>
                          {sub.isFeatured ? "⭐ Yes" : "No"}
                        </span>
                      </td>
                      <td>{sub.sortOrder || "-"}</td>
                      <td>
                        <div className="action-buttons-table">
                          <button 
                            className="btn-edit" 
                            onClick={() => handleEdit(sub)}
                          >
                            <i className="fas fa-edit"></i>
                            Edit
                          </button>
                          <button 
                            className="btn-delete" 
                            onClick={() => handleDelete(sub._id, sub.name)}
                          >
                            <i className="fas fa-trash"></i>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Main Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              {loading && (
                <div className="loading-overlay">
                  <div className="spinner"></div>
                </div>
              )}
              
              <div className="modal-header">
                <h2 className="modal-title">
                  {editMode ? "✏️ Edit Subcategory" : "➕ Add New Subcategory"}
                </h2>
                <button className="modal-close" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    {/* Name */}
                    <div className="form-group">
                      <label className="form-label required">Subcategory Name</label>
                      <input
                        type="text"
                        name="name"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        placeholder="Enter subcategory name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                      {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                    </div>

                    {/* Slug */}
                    <div className="form-group">
                      <label className="form-label">Slug</label>
                      <input
                        type="text"
                        name="slug"
                        className="form-control"
                        placeholder="auto-generated-slug"
                        value={formData.slug}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Category */}
                    <div className="form-group">
                      <label className="form-label required">Category</label>
                      <select
                        name="category"
                        className={`form-control ${errors.category ? 'is-invalid' : ''}`}
                        value={formData.category}
                        onChange={handleChange}
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                    </div>

                    {/* Status */}
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select
                        name="status"
                        className="form-control"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    {/* Sort Order */}
                    <div className="form-group">
                      <label className="form-label">Sort Order</label>
                      <input
                        type="number"
                        name="sortOrder"
                        className="form-control"
                        placeholder="0"
                        value={formData.sortOrder}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Featured */}
                    <div className="form-group">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          name="isFeatured"
                          className="form-check-input"
                          id="isFeatured"
                          checked={formData.isFeatured}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="isFeatured">
                          ⭐ Featured Subcategory
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      rows="3"
                      placeholder="Enter subcategory description"
                      value={formData.description}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  {/* Image Upload */}
                  <div className="form-group">
                    <label className="form-label">Image</label>
                    <div className="image-upload-area">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="file-input"
                        id="imageUpload"
                      />
                      <label htmlFor="imageUpload" className="file-label">
                        <i className="fas fa-cloud-upload-alt"></i>
                        <span>Choose Image</span>
                      </label>
                      {imagePreview && (
                        <div className="image-preview">
                          <img src={imagePreview} alt="Preview" />
                          <button
                            type="button"
                            className="remove-image"
                            onClick={() => {
                              setImage(null);
                              setImagePreview(null);
                            }}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SEO Section */}
                  <div className="seo-section">
                    <h3 className="section-title">🔍 SEO Settings</h3>
                    
                    <div className="form-group">
                      <label className="form-label">Meta Title</label>
                      <input
                        type="text"
                        name="metaTitle"
                        className="form-control"
                        placeholder="Enter meta title"
                        value={formData.metaTitle}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Meta Description</label>
                      <textarea
                        name="metaDescription"
                        className="form-control"
                        rows="3"
                        placeholder="Enter meta description"
                        value={formData.metaDescription}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-col"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          {editMode ? "Updating..." : "Adding..."}
                        </>
                      ) : (
                        <>
                          <i className={`fas ${editMode ? "fa-save" : "fa-plus"}`}></i>
                          {editMode ? "Update Subcategory" : "Add Subcategory"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Beautiful Confirmation Modal */}
        {showConfirmModal && (
          <div className="confirmation-overlay">
            <div className="confirmation-modal">
              <div className="confirmation-header">
                <div className="confirmation-icon">
                  <i className={confirmIcon}></i>
                </div>
                <h3 className="confirmation-title">{confirmTitle}</h3>
              </div>
              
              <div className="confirmation-body">
                <p className="confirmation-message">{confirmMessage}</p>
              </div>
              
              <div className="confirmation-footer">
                <button 
                  className="btn-cancel"
                  onClick={handleCancel}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
                <button 
                  className={`btn-confirm ${confirmButtonClass}`}
                  onClick={handleConfirm}
                >
                  <i className={confirmIcon}></i>
                  {confirmButtonText}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {showNotification && (
          <div className={`toast-notification ${notificationType} ${showNotification ? 'show' : ''}`}>
            <div className="toast-content">
              <div className="toast-icon">
                <i className={`fas ${
                  notificationType === 'success' ? 'fa-check-circle' : 
                  notificationType === 'error' ? 'fa-exclamation-circle' : 
                  'fa-info-circle'
                }`}></i>
              </div>
              <div className="toast-message">{notificationMessage}</div>
              <button 
                className="toast-close"
                onClick={() => setShowNotification(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add these styles to your CSS file */}
      <style jsx>{`
        /* Confirmation Modal Styles */
        .confirmation-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease;
        }

        .confirmation-modal {
          background: white;
          border-radius: 20px;
          max-width: 480px;
          width: 90%;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.3s ease;
        }

        .confirmation-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px 24px 20px;
          text-align: center;
        }

        .confirmation-icon {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 15px;
          font-size: 24px;
        }

        .confirmation-title {
          margin: 0;
          font-size: 22px;
          font-weight: 600;
        }

        .confirmation-body {
          padding: 30px 24px;
          text-align: center;
        }

        .confirmation-message {
          font-size: 16px;
          color: #4a5568;
          line-height: 1.6;
          margin: 0;
        }

        .confirmation-footer {
          padding: 0 24px 24px;
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .btn-cancel {
          background: #e2e8f0;
          color: #4a5568;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-cancel:hover {
          background: #cbd5e0;
          transform: translateY(-1px);
        }

        .btn-confirm {
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
        }

        .btn-confirm.btn-delete {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
        }

        .btn-confirm.btn-delete:hover {
          background: linear-gradient(135deg, #ff5252, #e84118);
          transform: translateY(-1px);
        }

        .btn-confirm.btn-edit {
          background: linear-gradient(135deg, #4dabf7, #339af0);
        }

        .btn-confirm.btn-edit:hover {
          background: linear-gradient(135deg, #339af0, #228be6);
          transform: translateY(-1px);
        }

        .btn-confirm.btn-add {
          background: linear-gradient(135deg, #51cf66, #40c057);
        }

        .btn-confirm.btn-add:hover {
          background: linear-gradient(135deg, #40c057, #37b24d);
          transform: translateY(-1px);
        }

        .btn-confirm.btn-update {
          background: linear-gradient(135deg, #ffd43b, #fab005);
        }

        .btn-confirm.btn-update:hover {
          background: linear-gradient(135deg, #fab005, #f59f00);
          transform: translateY(-1px);
        }

        /* Toast Notification Styles */
        .toast-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10001;
          max-width: 400px;
          opacity: 0;
          transform: translateX(100%);
          transition: all 0.3s ease;
        }

        .toast-notification.show {
          opacity: 1;
          transform: translateX(0);
        }

        .toast-content {
          background: white;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 12px;
          border-left: 4px solid;
        }

        .toast-notification.success .toast-content {
          border-left-color: #51cf66;
        }

        .toast-notification.error .toast-content {
          border-left-color: #ff6b6b;
        }

        .toast-notification.warning .toast-content {
          border-left-color: #ffd43b;
        }

        .toast-icon {
          font-size: 20px;
        }

        .toast-notification.success .toast-icon {
          color: #51cf66;
        }

        .toast-notification.error .toast-icon {
          color: #ff6b6b;
        }

        .toast-notification.warning .toast-icon {
          color: #ffd43b;
        }

        .toast-message {
          flex: 1;
          font-weight: 500;
          color: #2d3748;
        }

        .toast-close {
          background: none;
          border: none;
          color: #a0aec0;
          cursor: pointer;
          font-size: 14px;
          padding: 4px;
        }

        .toast-close:hover {
          color: #4a5568;
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(50px) scale(0.9);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default SubcategoryForm;