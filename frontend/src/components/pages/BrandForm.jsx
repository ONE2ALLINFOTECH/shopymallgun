import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Plus, Trash2, Search, Pencil } from "lucide-react";
import Dashboard from "../pages/Dashboard";
import "./SubsubcategoryPanel.css"; // Using the same CSS file
import api from "../api/api"
const BrandForm = () => {
  const [brands, setBrands] = useState([]);
  const [subsubcategories, setSubsubcategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubsubcategory, setFilterSubsubcategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [name, setName] = useState("");
  const [subsubcategory, setSubsubcategory] = useState("");

  useEffect(() => {
    fetchData();
    const escHandler = (e) => e.key === "Escape" && setShowModal(false);
    document.addEventListener("keydown", escHandler);
    return () => document.removeEventListener("keydown", escHandler);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const subsubRes = await api.get("/subsubcategory");
      const brandRes = await api.get("/brand");
      setSubsubcategories(subsubRes.data);
      setBrands(brandRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAddOrUpdate = async () => {
    if (!name || !subsubcategory) return alert("Fill all fields");
    try {
      if (isEditing) {
        await api.put(`/brand/${editId}`, {
          name,
          subsubcategory,
        });
      } else {
        await api.post("/brand", {
          name,
          subsubcategory,
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
    setSubsubcategory("");
    setIsEditing(false);
    setEditId(null);
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/brand/${confirmDeleteId}`);
      setConfirmDeleteId(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setName(item.name);
    setSubsubcategory(item.subsubcategory?._id);
    setEditId(item._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const filtered = brands
    .filter((b) => b.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((b) => (filterSubsubcategory ? b.subsubcategory?._id === filterSubsubcategory : true))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <Dashboard />
      <div className="container box-color mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">Manage Brands</h3>
          <button className="btn btn-add d-flex align-items-center" onClick={() => setShowModal(true)}>
            <Plus className="me-1" size={18} /> Add
          </button>
        </div>

        {/* Search & Filter */}
        <div className="search-filter-box mb-4 d-flex flex-wrap align-items-center gap-3">
          <div className="search-input position-relative">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              className="form-control ps-5 rounded-pill shadow-sm"
              placeholder="Search brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-dropdown">
            <select
              className="form-select rounded-pill shadow-sm"
              value={filterSubsubcategory}
              onChange={(e) => setFilterSubsubcategory(e.target.value)}
            >
              <option value="">Filter by Subsubcategory</option>
              {subsubcategories.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table View */}
        {loading ? (
          <p>Loading...</p>
        ) : filtered.length === 0 ? (
          <p>No brands found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-striped align-middle">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Brand Name</th>
                  <th>Subsubcategory</th>
                  <th>Products</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, index) => (
                  <tr key={b._id}>
                    <td>{index + 1}</td>
                    <td>{b.name}</td>
                    <td>{b.subsubcategory?.name || "N/A"}</td>
                    <td>{b.productCount || 0}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-info me-2" onClick={() => handleEdit(b)}>
                        <Pencil size={16} />
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(b._id)}>
                        <Trash2 size={16} />
                      </button>
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
                <h5 className="modal-title">{isEditing ? "Edit" : "Add"} Brand</h5>
                <button type="button" className="btn-close" onClick={resetForm}></button>
              </div>
              <div className="modal-body">
                <select
                  className="form-select mb-2"
                  value={subsubcategory}
                  onChange={(e) => setSubsubcategory(e.target.value)}
                >
                  <option value="">Select Subsubcategory</option>
                  {subsubcategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Brand name"
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
              <div className="modal-header text-white">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button type="button" className="btn-close" onClick={() => setConfirmDeleteId(null)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this brand? This action cannot be undone.</p>
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

export default BrandForm;