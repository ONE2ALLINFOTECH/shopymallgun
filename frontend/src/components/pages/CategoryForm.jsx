import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Pencil, Trash2, Save, X, Search, Plus, Image, FileText, CheckCircle, AlertCircle } from "lucide-react";
import "./CategoryForm.css";
import Dashboard from "../pages/Dashboard";

const CategoryForm = () => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState(null);
  const [banner, setBanner] = useState(null);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [status, setStatus] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [preview, setPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  // Confirmation Modal states - Updated to match subsubcategory design
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editedCategory, setEditedCategory] = useState({
    name: "",
    description: "",
    metaTitle: "",
    metaDescription: "",
    status: true,
    isFeatured: false,
    image: null,
    banner: null,
  });
  const [editedImagePreview, setEditedImagePreview] = useState(null);
  const [editedBannerPreview, setEditedBannerPreview] = useState(null);

  // Enhanced Toast/Popup states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // success, error, warning, info
  const toastRef = useRef(null);

  // Professional popup message function
  const showPopupMessage = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const showError = (msg) => {
    showPopupMessage(msg, "error");
  };

  const fetchCategories = async () => {
    const res = await axios.get("http://localhost:5000/api/category");
    setCategories(res.data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Modal functions
  const openAddModal = () => {
    setIsEditMode(false);
    setCurrentEditId(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setIsEditMode(true);
    setCurrentEditId(category._id);
    setName(category.name || "");
    setDesc(category.description || "");
    setMetaTitle(category.metaTitle || "");
    setMetaDesc(category.metaDescription || "");
    setStatus(category.status);
    setIsFeatured(category.isFeatured);
    setPreview(category.image);
    setBannerPreview(category.banner);
    setImage(null);
    setBanner(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDesc("");
    setImage(null);
    setBanner(null);
    setMetaTitle("");
    setMetaDesc("");
    setStatus(true);
    setIsFeatured(false);
    setPreview(null);
    setBannerPreview(null);
    setShowModal(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    setBanner(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    setEditedCategory({ ...editedCategory, image: file });
    setEditedImagePreview(URL.createObjectURL(file));
  };

  const handleEditBannerChange = (e) => {
    const file = e.target.files[0];
    setEditedCategory({ ...editedCategory, banner: file });
    setEditedBannerPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || (!image && !isEditMode)) {
      showError("⚠️ Category name and image are required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", desc);
    if (image) formData.append("image", image);
    if (banner) formData.append("banner", banner);
    formData.append("metaTitle", metaTitle);
    formData.append("metaDescription", metaDesc);
    formData.append("status", status);
    formData.append("isFeatured", isFeatured);

    try {
      setLoading(true);
      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/category/${currentEditId}`, formData);
        showPopupMessage(`✅ Category "${name}" updated successfully!`, "success");
      } else {
        await axios.post("http://localhost:5000/api/category", formData);
        showPopupMessage(`🎉 Category "${name}" added successfully!`, "success");
      }
      closeModal();
      fetchCategories();
    } catch (err) {
      showError("❌ Operation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Updated delete function to match subsubcategory design
  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };

  // Confirm delete function matching subsubcategory design
  const confirmDelete = async () => {
    const categoryToDelete = categories.find(cat => cat._id === confirmDeleteId);
    
    try {
      await axios.delete(`http://localhost:5000/api/category/${confirmDeleteId}`);
      showPopupMessage(`🗑️ Category "${categoryToDelete?.name}" deleted successfully!`, "warning");
      fetchCategories();
      setConfirmDeleteId(null);
    } catch (err) {
      showError("❌ Failed to delete category. Please try again.");
      setConfirmDeleteId(null);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setEditedCategory({
      name: category.name || "",
      description: category.description || "",
      metaTitle: category.metaTitle || "",
      metaDescription: category.metaDescription || "",
      status: category.status,
      isFeatured: category.isFeatured,
      image: null,
      banner: null,
    });
    setEditedImagePreview(category.image);
    setEditedBannerPreview(category.banner);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedCategory({
      name: "",
      description: "",
      metaTitle: "",
      metaDescription: "",
      status: true,
      isFeatured: false,
      image: null,
      banner: null,
    });
    setEditedImagePreview(null);
    setEditedBannerPreview(null);
    showPopupMessage("📝 Edit cancelled", "info");
  };

  const handleSaveEdit = async (id) => {
    try {
      const formData = new FormData();
      formData.append("name", editedCategory.name);
      formData.append("description", editedCategory.description);
      formData.append("metaTitle", editedCategory.metaTitle);
      formData.append("metaDescription", editedCategory.metaDescription);
      formData.append("status", editedCategory.status);
      formData.append("isFeatured", editedCategory.isFeatured);
      if (editedCategory.image) formData.append("image", editedCategory.image);
      if (editedCategory.banner) formData.append("banner", editedCategory.banner);

      await axios.put(`http://localhost:5000/api/category/${id}`, formData);
      showPopupMessage(`💫 Category "${editedCategory.name}" updated successfully!`, "success");
      cancelEdit();
      fetchCategories();
    } catch (err) {
      showError("❌ Failed to update category. Please try again.");
    }
  };

  const filtered = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  // Get toast styling based on type
  const getToastStyle = () => {
    switch (toastType) {
      case "success":
        return {
          header: "bg-success text-white",
          icon: <CheckCircle size={16} className="me-2" />,
          border: "border-success"
        };
      case "error":
        return {
          header: "bg-danger text-white",
          icon: <AlertCircle size={16} className="me-2" />,
          border: "border-danger"
        };
      case "warning":
        return {
          header: "bg-warning text-dark",
          icon: <AlertCircle size={16} className="me-2" />,
          border: "border-warning"
        };
      case "info":
        return {
          header: "bg-info text-white",
          icon: <AlertCircle size={16} className="me-2" />,
          border: "border-info"
        };
      default:
        return {
          header: "bg-primary text-white",
          icon: <CheckCircle size={16} className="me-2" />,
          border: "border-primary"
        };
    }
  };

  const toastStyle = getToastStyle();

  return (
    <>
      <Dashboard />
      <div className="container mt-4 category-panel">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="title mb-0">🗂️ Category Management Dashboard</h2>
          <button 
            className="btn btncolor" 
            onClick={openAddModal}
          >
            <Plus size={16} className="me-2" />
            Add New Category
          </button>
        </div>

        {/* Search Bar */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="position-relative">
              <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input 
                type="text" 
                className="form-control ps-5" 
                placeholder="Search categories..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* Enhanced Table Section */}
        <div className="table-responsive">
          <table className="table table-hover text-center align-middle">
            <thead className="table-dark">
              <tr>
                <th style={{ minWidth: '100px' }}>Image</th>
                <th style={{ minWidth: '150px' }}>Name</th>
                <th style={{ minWidth: '200px' }}>Description</th>
                <th style={{ minWidth: '100px' }}>Banner</th>
                <th style={{ minWidth: '150px' }}>Meta Title</th>
                <th style={{ minWidth: '180px' }}>Meta Description</th>
                <th style={{ minWidth: '100px' }}>Status</th>
                <th style={{ minWidth: '100px' }}>Featured</th>
                <th style={{ minWidth: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cat) => (
                <tr key={cat._id}>
                  <td>
                    {editingId === cat._id ? (
                      <div>
                        <input 
                          type="file" 
                          className="form-control mb-2" 
                          onChange={handleEditImageChange} 
                          accept="image/*"
                        />
                        {editedImagePreview && (
                          <img 
                            src={editedImagePreview} 
                            alt="Edit Preview" 
                            className="img-thumbnail" 
                            style={{ height: "60px", objectFit: "cover" }}
                          />
                        )}
                      </div>
                    ) : (
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="img-thumbnail" 
                        style={{ height: "60px", objectFit: "cover" }}
                      />
                    )}
                  </td>
                  
                  <td>
                    {editingId === cat._id ? (
                      <input 
                        type="text" 
                        className="form-control" 
                        value={editedCategory.name} 
                        onChange={(e) => setEditedCategory({...editedCategory, name: e.target.value})}
                      />
                    ) : (
                      <span className="fw-semibold text-dark">{cat.name}</span>
                    )}
                  </td>
                  
                  <td>
                    {editingId === cat._id ? (
                      <textarea 
                        className="form-control" 
                        rows="2"
                        value={editedCategory.description} 
                        onChange={(e) => setEditedCategory({...editedCategory, description: e.target.value})}
                      />
                    ) : (
                      <span className="text-muted">{cat.description}</span>
                    )}
                  </td>
                  
                  <td>
                    {editingId === cat._id ? (
                      <div>
                        <input 
                          type="file" 
                          className="form-control mb-2" 
                          onChange={handleEditBannerChange} 
                          accept="image/*"
                        />
                        {editedBannerPreview && (
                          <img 
                            src={editedBannerPreview} 
                            alt="Banner Edit Preview" 
                            className="img-thumbnail" 
                            style={{ height: "60px", objectFit: "cover" }}
                          />
                        )}
                      </div>
                    ) : (
                      cat.banner ? (
                        <img 
                          src={cat.banner} 
                          alt="Banner" 
                          className="img-thumbnail" 
                          style={{ height: "60px", objectFit: "cover" }}
                        />
                      ) : (
                        <span className="text-muted">No banner</span>
                      )
                    )}
                  </td>
                  
                  <td>
                    {editingId === cat._id ? (
                      <input 
                        type="text" 
                        className="form-control" 
                        value={editedCategory.metaTitle} 
                        onChange={(e) => setEditedCategory({...editedCategory, metaTitle: e.target.value})}
                      />
                    ) : (
                      <span className="text-muted">{cat.metaTitle || 'Not set'}</span>
                    )}
                  </td>
                  
                  <td>
                    {editingId === cat._id ? (
                      <input 
                        type="text" 
                        className="form-control" 
                        value={editedCategory.metaDescription} 
                        onChange={(e) => setEditedCategory({...editedCategory, metaDescription: e.target.value})}
                      />
                    ) : (
                      <span className="text-muted">{cat.metaDescription || 'Not set'}</span>
                    )}
                  </td>
                  
                  <td>
                    {editingId === cat._id ? (
                      <div className="form-check form-switch d-flex justify-content-center">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          checked={editedCategory.status} 
                          onChange={(e) => setEditedCategory({...editedCategory, status: e.target.checked})}
                        />
                      </div>
                    ) : (
                      <span className={`badge ${cat.status ? 'bg-success' : 'bg-danger'}`}>
                        {cat.status ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </td>
                  
                  <td>
                    {editingId === cat._id ? (
                      <div className="form-check form-switch d-flex justify-content-center">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          checked={editedCategory.isFeatured} 
                          onChange={(e) => setEditedCategory({...editedCategory, isFeatured: e.target.checked})}
                        />
                      </div>
                    ) : (
                      <span className={`badge ${cat.isFeatured ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                        {cat.isFeatured ? 'Featured' : 'Regular'}
                      </span>
                    )}
                  </td>
                  
                  <td>
                    {editingId === cat._id ? (
                      <div className="d-flex gap-2 justify-content-center">
                        <button 
                          className="btn btn-success btn-sm" 
                          onClick={() => handleSaveEdit(cat._id)}
                        >
                          <Save size={14} />
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={cancelEdit}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="d-flex gap-2 justify-content-center">
                        <button 
                          className="btn btn-outline-primary btn-sm" 
                          onClick={() => openEditModal(cat)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          className="btn btn-outline-danger btn-sm" 
                          onClick={() => handleDelete(cat._id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal fade show d-block" tabIndex="-1" onClick={resetForm}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    {isEditMode ? (
                      <>
                        <Pencil size={20} className="me-2" />
                        Edit Category
                      </>
                    ) : (
                      <>
                        <Plus size={20} className="me-2" />
                        Add New Category
                      </>
                    )}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={closeModal}
                  ></button>
                </div>
                
                <div className="modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      {/* Basic Information */}
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark">
                          <FileText size={16} className="me-1" />
                          Category Name *
                        </label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Enter category name" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark">Description</label>
                        <textarea 
                          className="form-control" 
                          rows="2"
                          placeholder="Enter category description" 
                          value={desc} 
                          onChange={(e) => setDesc(e.target.value)}
                        ></textarea>
                      </div>

                      {/* Image Upload */}
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark">
                          <Image size={16} className="me-1" />
                          Category Image {!isEditMode && '*'}
                        </label>
                        <input 
                          type="file" 
                          className="form-control" 
                          onChange={handleImageChange} 
                          accept="image/*"
                          required={!isEditMode}
                        />
                        {preview && (
                          <div className="mt-2">
                            <img src={preview} alt="Preview" className="img-thumbnail" style={{ height: "80px", objectFit: "cover" }} />
                          </div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark">Banner Image</label>
                        <input 
                          type="file" 
                          className="form-control" 
                          onChange={handleBannerChange} 
                          accept="image/*"
                        />
                        {bannerPreview && (
                          <div className="mt-2">
                            <img src={bannerPreview} alt="Banner Preview" className="img-thumbnail" style={{ height: "80px", objectFit: "cover" }} />
                          </div>
                        )}
                      </div>

                      {/* SEO Information */}
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark">Meta Title</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="SEO meta title" 
                          value={metaTitle} 
                          onChange={(e) => setMetaTitle(e.target.value)} 
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark">Meta Description</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="SEO meta description" 
                          value={metaDesc} 
                          onChange={(e) => setMetaDesc(e.target.value)} 
                        />
                      </div>

                      {/* Status and Featured */}
                      <div className="col-md-6">
                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="modalStatusSwitch"
                            checked={status} 
                            onChange={(e) => setStatus(e.target.checked)} 
                          />
                          <label className="form-check-label fw-semibold" htmlFor="modalStatusSwitch">
                            Active Status
                          </label>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="modalFeaturedSwitch"
                            checked={isFeatured} 
                            onChange={(e) => setIsFeatured(e.target.checked)} 
                          />
                          <label className="form-check-label fw-semibold" htmlFor="modalFeaturedSwitch">
                            Featured
                          </label>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={closeModal}
                  >
                    <X size={16} className="me-1" />
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btncolor" 
                    disabled={loading}
                    onClick={handleSubmit}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        {isEditMode ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      <>
                        {isEditMode ? <Save size={16} className="me-1" /> : <Plus size={16} className="me-1" />}
                        {isEditMode ? 'Update Category' : 'Add Category'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Delete Modal - Matching subsubcategory design */}
        {confirmDeleteId && (
          <div className="modal fade show d-block confirm-modal" tabIndex="-1" onClick={() => setConfirmDeleteId(null)}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content border-danger">
                <div className="modal-header text-white">
                  <h5 className="modal-title">Confirm Deletion</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setConfirmDeleteId(null)}></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this category? This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                  <button className="btn btn-danger" onClick={confirmDelete}>Yes, Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Professional Toast Notification */}
        {showToast && (
          <div 
            ref={toastRef}
            className={`toast show position-fixed top-0 end-0 m-3 ${toastStyle.border}`}
            style={{ 
              zIndex: 9999,
              minWidth: '350px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
              borderWidth: '2px'
            }}
          >
            <div className={`toast-header ${toastStyle.header}`}>
              <div className="d-flex align-items-center">
                {toastStyle.icon}
                <strong className="me-auto">
                  {toastType === 'success' && 'Success'}
                  {toastType === 'error' && 'Error'}
                  {toastType === 'warning' && 'Warning'}
                  {toastType === 'info' && 'Information'}
                </strong>
              </div>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowToast(false)}
              ></button>
            </div>
            <div className="toast-body bg-white p-3">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  {toastMessage}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CategoryForm;