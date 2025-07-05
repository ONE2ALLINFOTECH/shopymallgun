import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Plus, Trash2, Search, Pencil } from "lucide-react";
import Dashboard from "../pages/Dashboard";
import "./SubsubcategoryPanel.css";

const SubsubcategoryPanel = () => {
  const [subsubcategories, setSubsubcategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubcategory, setFilterSubcategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [name, setName] = useState("");
  const [subcategory, setSubcategory] = useState("");

  useEffect(() => {
    fetchData();
    const escHandler = (e) => e.key === "Escape" && setShowModal(false);
    document.addEventListener("keydown", escHandler);
    return () => document.removeEventListener("keydown", escHandler);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const subs = await axios.get("http://localhost:5000/api/subcategory");
      const subsubs = await axios.get("http://localhost:5000/api/subsubcategory");
      setSubcategories(subs.data);
      setSubsubcategories(subsubs.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAddOrUpdate = async () => {
    if (!name || !subcategory) return alert("Fill all fields");
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/subsubcategory/${editId}`, {
          name,
          subcategory,
        });
      } else {
        await axios.post("http://localhost:5000/api/subsubcategory", {
          name,
          subcategory,
        });
      }
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setName("");
    setSubcategory("");
    setIsEditing(false);
    setEditId(null);
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/subsubcategory/${confirmDeleteId}`);
      setConfirmDeleteId(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setName(item.name);
    setSubcategory(item.subcategory?._id);
    setEditId(item._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const getFormPath = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes("baby carrier")) return "/admin/add-baby-carrier";
    if (lower.includes("bouncer")) return "/admin/add-baby-bouncer";
    if (lower.includes("baby beds")) return "/admin/baby-bag";
    if (lower.includes("stroller")) return "/admin/add-stroller";
    return `/admin/add-product/${lower}`;
  };

  const filtered = subsubcategories
    .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((s) => (filterSubcategory ? s.subcategory?._id === filterSubcategory : true))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <Dashboard />
      <div className="container box-color mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">Manage Subsubcategories</h3>
          <button className="btn btn-add d-flex align-items-center" onClick={() => setShowModal(true)}>
            <Plus className="me-1" size={18} /> Add
          </button>
        </div>

        {/* ✅ Custom Search & Filter */}
        <div className="search-filter-box mb-4 d-flex flex-wrap align-items-center gap-3">
          <div className="search-input position-relative">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              className="form-control ps-5 rounded-pill shadow-sm"
              placeholder="Search subsubcategory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-dropdown">
            <select
              className="form-select rounded-pill shadow-sm"
              value={filterSubcategory}
              onChange={(e) => setFilterSubcategory(e.target.value)}
            >
              <option value="">Filter by Subcategory</option>
              {subcategories.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ✅ Table View */}
        {loading ? (
          <p>Loading...</p>
        ) : filtered.length === 0 ? (
          <p>No subsubcategories found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-striped align-middle">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Subcategory</th>
                  <th>Products</th>
                  <th>Actions</th>
                  <th>Add Product</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, index) => (
                  <tr key={s._id}>
                    <td>{index + 1}</td>
                    <td>{s.name}</td>
                    <td>{s.subcategory?.name || "N/A"}</td>
                    <td>{s.productCount || 0}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-info me-2" onClick={() => handleEdit(s)}>
                        <Pencil size={16} />
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s._id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                    <td>
                      <Link to={getFormPath(s.name)} className="btn btn-sm btn-outline-primary">
                        Add Product →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" onClick={resetForm}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEditing ? "Edit" : "Add"} Subsubcategory</h5>
                <button type="button" className="btn-close" onClick={resetForm}></button>
              </div>
              <div className="modal-body">
                <select
                  className="form-select mb-2"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                >
                  <option value="">Select Subcategory</option>
                  {subcategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Subsubcategory name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                <button className="btn btn-color" onClick={handleAddOrUpdate}>
                  {isEditing ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDeleteId && (
        <div className="modal fade show d-block confirm-modal" tabIndex="-1" onClick={() => setConfirmDeleteId(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-danger">
              <div className="modal-header  text-white">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button type="button" className="btn-close" onClick={() => setConfirmDeleteId(null)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this subsubcategory? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={confirmDelete}>Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubsubcategoryPanel;
