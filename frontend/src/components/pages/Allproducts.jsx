import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import api from "../api/api"
const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const handleDelete = async (id) => {
    setProductToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/products/${productToDelete}`);
      setProducts(products.filter(p => p._id !== productToDelete));
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      alert("Failed to delete product.");
      console.error("Delete error:", err);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <>
      <Dashboard />
      <div className="container mt-4">
        <h4>All Products</h4>
        <div className="table-responsive">
          <table className="table table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>Product Image</th>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Final Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td>
                    <img src={p.thumbnail?.url} alt="" width={50} height={50} style={{ objectFit: "cover" }} />
                  </td>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>₹{p.price}</td>
                  <td>{p.discount}%</td>
                  <td>₹{p.finalPrice}</td>
                  <td>
                    <Link to={`/admin/edit/${p._id}`} className="btn btn-sm btn-success me-2">Edit</Link>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Beautiful Delete Modal */}
      {showDeleteModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div 
            className="modal fade show" 
            style={{ display: 'block', zIndex: 1050 }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow-lg border-0">
                <div className="modal-header  text-white border-0">
                  <h5 className="modal-title d-flex align-items-center">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Confirm Delete
                  </h5>
                </div>
                <div className="modal-body text-center py-4">
                  <div className="mb-3">
                    <i className="fas fa-trash-alt text-danger" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h6 className="mb-3">Are you sure you want to delete this product?</h6>
                  <p className="text-muted mb-0">This action cannot be undone. The product will be permanently removed from your inventory.</p>
                </div>
                <div className="modal-footer border-0 justify-content-center">
                  <button 
                    type="button" 
                    className="btn btn-secondary px-4 me-2" 
                    onClick={cancelDelete}
                  >
                    <i className="fas fa-times me-1"></i>
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger px-4" 
                    onClick={confirmDelete}
                  >
                    <i className="fas fa-trash me-1"></i>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ProductList;