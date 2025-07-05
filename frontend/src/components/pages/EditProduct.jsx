// imports remain same...
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import "./EditForm.css";
import { Form, Row, Col, Button, Alert, Modal } from "react-bootstrap";
import api from "../api/api"
const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({});
  const [thumbnail, setThumbnail] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [video, setVideo] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [subsubcategories, setSubsubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  const showAlert = (msg, type = "info") => {
    alert(`${type.toUpperCase()}: ${msg}`);
  };

  // Load product details
  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then(async (res) => {
        const product = res.data;
        const categoryId = product.category?._id || "";
        const subcategoryId = product.subcategory?._id || "";

        setForm({
          ...product,
          category: categoryId,
          subcategory: subcategoryId,
          subsubcategory: product.subsubcategory?._id || "",
          brand: product.brand?._id || "",
        });

        if (categoryId) await fetchSubcategories(categoryId);
        if (subcategoryId) await fetchSubsubcategories(subcategoryId);
      })
      .catch((err) => console.error("Error loading product:", err));
  }, [id]);
  const handleArrayChange = (index, field, value) => {
    const updated = [...form[field]];
    updated[index] = value;
    setForm((prev) => ({ ...prev, [field]: updated }));
  };

  const addField = (field) => {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeField = (field, index) => {
    const updated = [...form[field]];
    updated.splice(index, 1);
    setForm((prev) => ({ ...prev, [field]: updated }));
  };

  // Fetch categories and brands
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get("/category"),
          api.get("/brand"),
        ]);
        setCategories(catRes.data);
        setBrands(brandRes.data);
      } catch (err) {
        showAlert("Failed to load categories or brands", "danger");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch subcategories
  const fetchSubcategories = async (categoryId) => {
    try {
      const res = await api.get(
        `/subcategory/${categoryId}`
      );
      setSubcategories(res.data);
    } catch (error) {
      setSubcategories([]);
      showAlert("Failed to load subcategories", "warning");
    }
  };

  // Fetch subsubcategories
  const fetchSubsubcategories = async (subcategoryId) => {
    try {
      const res = await api.get(
        `/subsubcategory/${subcategoryId}`
      );
      setSubsubcategories(res.data);
    } catch (error) {
      setSubsubcategories([]);
      showAlert("Failed to load subsubcategories", "warning");
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "specifications") {
      const specs = value.split(",").reduce((acc, item) => {
        const [key, val] = item.split(":").map((str) => str.trim());
        if (key && val !== undefined) {
          acc[key] = val;
        }
        return acc;
      }, {});
      setForm((prev) => ({
        ...prev,
        specifications: specs,
      }));
    } else if (name === "highlights") {
      const list = value.split(",").map((item) => item.trim());
      setForm((prev) => ({
        ...prev,
        highlights: list,
      }));
    } else if (name === "offers") {
      const list = value.split(",").map((item) => item.trim());
      setForm((prev) => ({
        ...prev,
        offers: list,
      }));
    }

    if (["local", "zonal", "national"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
        ...(name === "category" && { subcategory: "", subsubcategory: "" }),
        ...(name === "subcategory" && { subsubcategory: "" }),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("data", JSON.stringify(form));
    if (thumbnail) data.append("thumbnail", thumbnail);
    if (video) data.append("video", video);
    for (let file of gallery) data.append("gallery", file);

    try {
      await api.put(`/products/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Product updated successfully!");
      navigate("/products");
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Error updating product");
    }
  };

  return (
    <>
      <Dashboard />
      <div className="container mt-4">
        <div className="card shadow-lg border-0">
          <div className="card-header  text-white">
            <h4 className="mb-0">
              <i className="fas fa-edit me-2"></i>Edit Product
            </h4>
          </div>
          <div className="card-body">
            <ul className="nav nav-pills nav-fill mb-4">
              {[
                "basic",
                "pricing",
                "media",
                "inventory",
                "manufacture",
                "genral",
              ].map((tab) => (
                <li className="nav-item" key={tab}>
                  <button
                    type="button"
                    className={`nav-link ${activeTab === tab ? "active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === "basic" && (
                      <>
                        <i className="fas fa-info-circle me-2"></i>Basic Info
                      </>
                    )}
                    {tab === "pricing" && (
                      <>
                        <i class="fa-solid fa-indian-rupee-sign me-2"></i>
                        Pricing
                      </>
                    )}
                    {tab === "media" && (
                      <>
                        <i className="fas fa-images me-2"></i>Media
                      </>
                    )}
                    {tab === "inventory" && (
                      <>
                        <i className="fas fa-boxes me-2"></i>Inventory
                      </>
                    )}

                    {tab === "manufacture" && (
                      <>
                        <i className="fas fa-list-alt me-2"></i>Manufacture
                      </>
                    )}
                    {tab === "genral" && (
                      <>
                        <i className="fas fa-list-alt me-2"></i>Genral
                      </>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="tab-content">
                {activeTab === "basic" && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">SKU</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.sku || ""}
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Product Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={form.name || ""}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        name="description"
                        rows="4"
                        className="form-control"
                        value={form.description || ""}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Category</label>
                        <select
                          name="category"
                          className="form-select"
                          value={form.category || ""}
                          onChange={handleChange}
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label">Subcategory</label>
                        <select
                          name="subcategory"
                          className="form-select"
                          value={form.subcategory || ""}
                          onChange={handleChange}
                        >
                          <option value="">Select Subcategory</option>
                          {subcategories.map((sub) => (
                            <option key={sub._id} value={sub._id}>
                              {sub.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label">Subsubcategory</label>
                        <select
                          name="subsubcategory"
                          className="form-select"
                          value={form.subsubcategory || ""}
                          onChange={handleChange}
                        >
                          <option value="">Select Subsubcategory</option>
                          {subsubcategories.map((subsub) => (
                            <option key={subsub._id} value={subsub._id}>
                              {subsub.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4 mb-3">
                        <label className="form-label">Brand</label>
                        <select
                          name="brand"
                          className="form-select"
                          value={form.brand || ""}
                          onChange={handleChange}
                        >
                          <option value="">Select Brand</option>
                          {brands.map((brand) => (
                            <option key={brand._id} value={brand._id}>
                              {brand.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold">
                          Specifications
                        </label>
                        <textarea
                          name="specifications"
                          value={
                            form.specifications
                              ? Object.entries(form.specifications)
                                  .map(([key, val]) => `${key}:${val}`)
                                  .join(", ")
                              : ""
                          }
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Format: Color:Red, Size:Large"
                        />
                      </div>
                      {/* Highlights */}
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold">Highlights</label>
                        <textarea
                          name="highlights"
                          value={
                            Array.isArray(form.highlights)
                              ? form.highlights.join(", ")
                              : ""
                          }
                          onChange={handleChange}
                          className="form-control"
                          rows="3"
                          placeholder="Enter highlights (comma separated)"
                        />
                      </div>
                      {/* Offers */}
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold">Offers</label>
                        <textarea
                          name="offers"
                          onChange={handleChange}
                          value={
                            Array.isArray(form.offers)
                              ? form.offers.join(", ")
                              : ""
                          }
                          className="form-control"
                          rows="3"
                          placeholder="Enter offers (comma separated)"
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold">
                          Listing Status *
                        </label>
                        <select
                          name="listingStatus"
                          onChange={handleChange}
                          value={form.listingStatus}
                          className="form-control"
                        >
                          <option value="">Select One</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
                {/* Pricing Tab */}
                {activeTab === "pricing" && (
                  <div className="tab-pane fade show active">
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold">
                          <i class="fa-solid fa-indian-rupee-sign"></i> Your
                          Selling Price
                        </label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="price"
                            className="form-control"
                            value={form.price || ""}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold">
                          <i className="fas fa-percentage me-2"></i>Discount (%)
                        </label>
                        <div className="input-group input-group-lg">
                          <input
                            type="number"
                            name="discount"
                            className="form-control"
                            value={form.discount || ""}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            max="100"
                          />
                          <span className="input-group-text">%</span>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold">
                          <i className="fas fa-money-bill me-2"></i>MRP
                        </label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="mrp"
                            className="form-control"
                            value={form.mrp || ""}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div className="col-md-12 mb-3">
                        <label className="form-label fw-bold">
                          <i className="fas fa-money-bill me-2"></i>Minimum
                          Order Quantity
                        </label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            name="minOrderQty"
                            className="form-control"
                            value={form.minOrderQty || ""}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div className="col-md-12 mb-3">
                        <label className="form-label fw-bold">
                          <i className="fas fa-shipping-fast me-2"></i>Shipping
                          Charges
                        </label>
                        <hr />
                      </div>
                      <div className="col-md-12 mb-3">
                        <label className="form-label fw-bold">
                          Shippingprovider
                        </label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text">₹</span>
                          <input
                            type="string"
                            name="shippingProvider"
                            className="form-control"
                            value={form.shippingProvider || ""}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <Form.Group className="mb-3 col-md-4">
                        <Form.Label>Local</Form.Label>
                        <Form.Control
                          type="number"
                          name="local"
                          value={form.local || ""}
                          onChange={handleChange}
                          placeholder="Local delivery charge"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3 col-md-4">
                        <Form.Label>Zonal</Form.Label>
                        <Form.Control
                          type="number"
                          name="zonal"
                          value={form.zonal || ""}
                          onChange={handleChange}
                          placeholder="Zonal delivery charge"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3 col-md-4">
                        <Form.Label>National</Form.Label>
                        <Form.Control
                          type="number"
                          name="national"
                          value={form.national || ""}
                          onChange={handleChange}
                          placeholder="National delivery charge"
                        />
                      </Form.Group>
                      <div className="row">
                        {/* Length (cm) */}
                        <div className="col-md-3 mb-3">
                          <label className="form-label fw-bold">
                            Length (cm)
                          </label>
                          <input
                            type="number"
                            name="lengthCM"
                            className="form-control"
                            value={form.lengthCM || ""}
                            onChange={handleChange}
                            placeholder="Enter length in cm"
                          />
                        </div>

                        {/* Breadth (cm) */}
                        <div className="col-md-3 mb-3">
                          <label className="form-label fw-bold">
                            Breadth (cm)
                          </label>
                          <input
                            type="number"
                            name="breadthCM"
                            className="form-control"
                            value={form.breadthCM || ""}
                            onChange={handleChange}
                            placeholder="Enter breadth in cm"
                          />
                        </div>

                        {/* Height (cm) */}
                        <div className="col-md-3 mb-3">
                          <label className="form-label fw-bold">
                            Height (cm)
                          </label>
                          <input
                            type="number"
                            name="heightCM"
                            className="form-control"
                            value={form.heightCM || ""}
                            onChange={handleChange}
                            placeholder="Enter height in cm"
                          />
                        </div>

                        {/* Weight (kg) */}
                        <div className="col-md-3 mb-3">
                          <label className="form-label fw-bold">
                            Weight (kg)
                          </label>
                          <input
                            type="number"
                            name="weightKG"
                            className="form-control"
                            value={form.weightKG || ""}
                            onChange={handleChange}
                            placeholder="Enter weight in kg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Media Tab */}
                {activeTab === "media" && (
                  <div className="tab-pane fade show active">
                    <div className="row">
                      <div className="col-md-6 mb-4">
                        <label className="form-label fw-bold">
                          <i className="fas fa-image me-2"></i>Thumbnail Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control form-control-lg"
                          onChange={(e) => setThumbnail(e.target.files[0])}
                        />
                        {form.thumbnail?.url && (
                          <div className="mt-3">
                            <img
                              src={form.thumbnail.url}
                              alt="thumb"
                              className="img-thumbnail shadow"
                              style={{
                                width: "150px",
                                height: "150px",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="col-md-6 mb-4">
                        <label className="form-label fw-bold">
                          <i className="fas fa-images me-2"></i>Gallery Images
                        </label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="form-control form-control-lg"
                          onChange={(e) => setGallery([...e.target.files])}
                        />
                        <div className="d-flex flex-wrap gap-2 mt-3">
                          {form.gallery?.map((img, i) => (
                            <img
                              key={i}
                              src={img.url}
                              alt="gallery"
                              className="img-thumbnail shadow"
                              style={{
                                width: "80px",
                                height: "80px",
                                objectFit: "cover",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label fw-bold">
                          <i className="fas fa-video me-2"></i>Product Video
                        </label>
                        <input
                          type="file"
                          accept="video/*"
                          className="form-control form-control-lg"
                          onChange={(e) => setVideo(e.target.files[0])}
                        />
                        {form.video?.url && (
                          <div className="mt-3">
                            <video
                              controls
                              className="shadow rounded"
                              style={{ width: "300px", height: "200px" }}
                            >
                              <source src={form.video.url} />
                            </video>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Inventory Tab */}
              {activeTab === "inventory" && (
                <>
                  <h5 className="mt-4">Inventory Details</h5>
                  <div className="row">
                    <div className="mb-3 col-md-3">
                      <label className="form-label fw-bold">
                        Fulfilment By *
                      </label>
                      <select
                        name="fulfilmentBy"
                        className="form-select"
                        value={form.fulfilmentBy}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select One</option>
                        <option value="seller">Seller</option>
                        <option value="marketplace">Marketplace</option>
                      </select>
                    </div>

                    <div className="mb-3 col-md-3">
                      <label className="form-label fw-bold">
                        Procurement Type
                      </label>
                      <select
                        name="procurementType"
                        className="form-select"
                        value={form.procurementType}
                        onChange={handleChange}
                      >
                        <option value="">Select One</option>
                        <option value="made_to_order">Made to Order</option>
                        <option value="stock">Stock</option>
                      </select>
                    </div>

                    <div className="mb-3 col-md-3">
                      <label className="form-label fw-bold">
                        Procurement SLA (Days) *
                      </label>
                      <input
                        type="number"
                        name="procurementSLA"
                        className="form-control"
                        value={form.procurementSLA}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3 col-md-3">
                      <label className="form-label fw-bold">Stock *</label>
                      <input
                        type="number"
                        name="stock"
                        className="form-control"
                        value={form.stock}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === "manufacture" && (
                <>
                  <div className="row">
                    {/* HSN Code */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold">HSN Code *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="hsn"
                        value={form.hsn}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Luxury Cess */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold">
                        Luxury Cess (%)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="luxuryCess"
                        value={form.luxuryCess}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Tax Code */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold">Tax Code *</label>
                      <select
                        className="form-select"
                        name="taxCode"
                        value={form.taxCode}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select One</option>
                        <option value="GST5">GST 5%</option>
                        <option value="GST12">GST 12%</option>
                        <option value="GST18">GST 18%</option>
                      </select>
                    </div>
                  </div>

                  {/* Country of Origin, Manufacturer, Packer, Importer */}
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <label className="form-label fw-bold">
                        Country of Origin *
                      </label>
                      <select
                        className="form-select"
                        name="countryOfOrigin"
                        value={form.countryOfOrigin}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select</option>
                        <option value="IN">India</option>
                        <option value="CN">China</option>
                        <option value="US">USA</option>
                      </select>
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label fw-bold">
                        Manufacturer *
                      </label>
                      <input
                        type="text"
                        name="manufacturerDetails"
                        className="form-control"
                        value={form.manufacturerDetails}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label fw-bold">Packer *</label>
                      <input
                        type="text"
                        name="packerDetails"
                        className="form-control"
                        value={form.packerDetails}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label fw-bold">Importer</label>
                      <input
                        type="text"
                        name="importerDetails"
                        className="form-control"
                        value={form.importerDetails}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold">Model Name</label>
                      <input
                        type="text"
                        name="modelName"
                        className="form-control"
                        value={form.modelName}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold">Model Number</label>
                      <input
                        type="text"
                        name="modelNumber"
                        className="form-control"
                        value={form.modelNumber}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold">Type</label>
                      <select
                        className="form-select"
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                      >
                        <option value="">Select One</option>
                        <option value="Type 1">Type 1</option>
                        <option value="Type 2">Type 2</option>
                      </select>
                    </div>
                  </div>

                  {/* Brand Color (Array Field) */}
                  <label className="form-label fw-bold">Brand Color</label>
                  {form.brandColors.map((color, idx) => (
                    <div className="d-flex mb-2" key={idx}>
                      <input
                        className="form-control me-2"
                        value={color}
                        onChange={(e) =>
                          handleArrayChange(idx, "brandColors", e.target.value)
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removeField("brandColors", idx)}
                        className="btn btn-danger btn-sm me-1"
                      >
                        −
                      </button>
                      {idx === form.brandColors.length - 1 && (
                        <button
                          type="button"
                          onClick={() => addField("brandColors")}
                          className="btn btn-success btn-sm"
                        >
                          +
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Age Fields */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Maximum Age (Month)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="maxAge"
                        value={form.maxAge}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Minimum Age (Month)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="minAge"
                        value={form.minAge}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Sales Package */}
                  <label className="form-label fw-bold">Sales Package</label>
                  {form.salesPackages.map((pkg, idx) => (
                    <div key={idx} className="d-flex mb-2">
                      <input
                        className="form-control me-2"
                        value={pkg}
                        onChange={(e) =>
                          handleArrayChange(
                            idx,
                            "salesPackages",
                            e.target.value
                          )
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removeField("salesPackages", idx)}
                        className="btn btn-danger btn-sm me-1"
                      >
                        −
                      </button>
                      {idx === form.salesPackages.length - 1 && (
                        <button
                          type="button"
                          onClick={() => addField("salesPackages")}
                          className="btn btn-success btn-sm"
                        >
                          +
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Weight Capacity */}
                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label fw-bold">
                        Weight Capacity
                      </label>
                      <div className="d-flex">
                        <input
                          type="number"
                          className="form-control me-2"
                          name="weightCapacity.value"
                          value={form.weightCapacity.value}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              weightCapacity: {
                                ...form.weightCapacity,
                                value: e.target.value,
                              },
                            })
                          }
                        />
                        <select
                          className="form-select"
                          name="weightCapacity.unit"
                          value={form.weightCapacity.unit}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              weightCapacity: {
                                ...form.weightCapacity,
                                unit: e.target.value,
                              },
                            })
                          }
                        >
                          <option value="G">G</option>
                          <option value="KG">KG</option>
                          <option value="LB">LB</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Material */}
                  <div className="mb-3">
                    <label className="form-label">Material</label>
                    <select
                      className="form-select"
                      name="material"
                      value={form.material}
                      onChange={handleChange}
                    >
                      <option value="">Select One</option>
                      <option value="Plastic">Plastic</option>
                      <option value="Metal">Metal</option>
                    </select>
                  </div>

                  {/* Colors (Array of Selects) */}
                  <label className="form-label fw-bold">Colors</label>
                  {form.colors.map((color, idx) => (
                    <div key={idx} className="d-flex mb-2">
                      <select
                        className="form-select me-2"
                        value={color}
                        onChange={(e) =>
                          handleArrayChange(idx, "colors", e.target.value)
                        }
                      >
                        <option value="">Select One</option>
                        <option value="Red">Red</option>
                        <option value="Blue">Blue</option>
                        <option value="Black">Black</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeField("colors", idx)}
                        className="btn btn-danger btn-sm me-1"
                      >
                        −
                      </button>
                      {idx === form.colors.length - 1 && (
                        <button
                          type="button"
                          onClick={() => addField("colors")}
                          className="btn btn-success btn-sm"
                        >
                          +
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Carrying Positions */}
                  <label className="form-label fw-bold">
                    Carrying Positions
                  </label>
                  {form.carryingPositions.map((pos, idx) => (
                    <div key={idx} className="d-flex mb-2">
                      <select
                        className="form-select me-2"
                        value={pos}
                        onChange={(e) =>
                          handleArrayChange(
                            idx,
                            "carryingPositions",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select One</option>
                        <option value="Front Carry">Front Carry</option>
                        <option value="Back Carry">Back Carry</option>
                        <option value="Hip Carry">Hip Carry</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeField("carryingPositions", idx)}
                        className="btn btn-danger btn-sm me-1"
                      >
                        −
                      </button>
                      {idx === form.carryingPositions.length - 1 && (
                        <button
                          type="button"
                          onClick={() => addField("carryingPositions")}
                          className="btn btn-success btn-sm"
                        >
                          +
                        </button>
                      )}
                    </div>
                  ))}
                </>
              )}

              {activeTab === "genral" && (
                <>
                  <h5>General</h5>
                  <div className="row">
                    <div className="mb-3 col-md-4">
                      <input
                        type="text"
                        name="ean"
                        className="form-control"
                        placeholder="EAN/UPC"
                        value={form.ean}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3 col-md-4">
                      <input
                        type="text"
                        name="character"
                        className="form-control"
                        placeholder="Character"
                        value={form.character}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3 col-md-4">
                      <input
                        type="text"
                        name="description"
                        className="form-control"
                        placeholder="Description"
                        value={form.description}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3 col-md-4">
                      <input
                        type="text"
                        name="searchKeywords"
                        className="form-control"
                        placeholder="Search Keywords"
                        value={form.searchKeywords}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3 col-md-4">
                      <input
                        type="text"
                        name="keyFeatures"
                        className="form-control"
                        placeholder="Key Features"
                        value={form.keyFeatures}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3 col-md-4">
                      <input
                        type="text"
                        name="externalId"
                        className="form-control"
                        placeholder="External Identifier"
                        value={form.externalId}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3 col-md-4">
                      <input
                        type="text"
                        name="netQuantity"
                        className="form-control"
                        placeholder="Net Quantity"
                        value={form.netQuantity}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <h5>Dimensions</h5>
                  <div className="row">
                    <div className="mb-3 col-md-4">
                      <input
                        type="text"
                        name="width"
                        className="form-control"
                        placeholder="Width (cm)"
                        value={form.width}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3 col-md-4">
                      <input
                        type="text"
                        name="height"
                        className="form-control"
                        placeholder="Height (cm)"
                        value={form.height}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3 col-md-4">
                      <input
                        type="text"
                        name="depth"
                        className="form-control"
                        placeholder="Depth (cm)"
                        value={form.depth}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3 col-md-4">
                      <input
                        type="text"
                        name="weight"
                        className="form-control"
                        placeholder="Weight (g)"
                        value={form.weight}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3 col-md-4">
                      <input
                        type="text"
                        name="assembledWidth"
                        className="form-control"
                        placeholder="Assembled Width (cm)"
                        value={form.assembledWidth}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3 col-md-4">
                      <input
                        type="text"
                        name="assembledHeight"
                        className="form-control"
                        placeholder="Assembled Height (cm)"
                        value={form.assembledHeight}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3 col-md-4">
                      <input
                        type="text"
                        name="assembledDepth"
                        className="form-control"
                        placeholder="Assembled Depth (cm)"
                        value={form.assembledDepth}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3 col-md-4">
                      <input
                        type="text"
                        name="otherDimensions"
                        className="form-control"
                        placeholder="Other Dimensions"
                        value={form.otherDimensions}
                        onChange={handleChange}
                      />
                    </div>
                    <h5>Body Features</h5>
                    <div className="row">
                      <div className="mb-3 col-md-4">
                        <input
                          type="text"
                          name="wheelType"
                          className="form-control"
                          placeholder="Wheel Type"
                          value={form.wheelType}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3 col-md-4">
                        <input
                          type="text"
                          name="legSupport"
                          className="form-control"
                          placeholder="Leg Support"
                          value={form.legSupport}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3 col-md-4">
                        <input
                          type="text"
                          name="headSupport"
                          className="form-control"
                          placeholder="Head Support"
                          value={form.headSupport}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3 col-md-4">
                        <input
                          type="text"
                          name="otherBodyFeatures"
                          className="form-control"
                          placeholder="Other Body Features"
                          value={form.otherBodyFeatures}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <h5>Safety Features</h5>
                    <div className="row">
                      <div className="mb-3 col-md-4">
                        <input
                          type="text"
                          name="harnessType"
                          className="form-control"
                          placeholder="Harness Type"
                          value={form.harnessType}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <h5>Box Dimensions</h5>
                    <div className="row">
                      <div className="mb-3 col-md-4">
                        <input
                          type="text"
                          name="boxWidth"
                          className="form-control"
                          placeholder="Box Width (cm)"
                          value={form.boxWidth}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3 col-md-4">
                        <input
                          type="text"
                          name="boxLength"
                          className="form-control"
                          placeholder="Box Length (cm)"
                          value={form.boxLength}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3 col-md-4">
                        <input
                          type="text"
                          name="boxDepth"
                          className="form-control"
                          placeholder="Box Depth (cm)"
                          value={form.boxDepth}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3 col-md-4">
                        <input
                          type="text"
                          name="boxWeight"
                          className="form-control"
                          placeholder="Box Weight (kg)"
                          value={form.boxWeight}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <h5>Additional Features</h5>
                    <div className="row">
                      <div className="mb-3 col-md-4">
                        <input
                          type="text"
                          name="otherFeatures"
                          className="form-control"
                          placeholder="Other Features"
                          value={form.otherFeatures}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <h5>Warranty</h5>
                    <div className="row">
                      <div className="mb-3 col-md-4">
                        <input
                          type="text"
                          name="domesticWarranty"
                          className="form-control"
                          placeholder="Domestic Warranty"
                          value={form.domesticWarranty}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3 col-md-4">
                        <input
                          type="text"
                          name="internationalWarranty"
                          className="form-control"
                          placeholder="International Warranty"
                          value={form.internationalWarranty}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3 col-md-4">
                        <input
                          type="text"
                          name="warrantySummary"
                          className="form-control"
                          placeholder="Warranty Summary"
                          value={form.warrantySummary}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3 col-md-4">
                        <input
                          type="text"
                          name="warrantyServiceType"
                          className="form-control"
                          placeholder="Warranty Service Type"
                          value={form.warrantyServiceType}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3 col-md-4">
                        <input
                          type="text"
                          name="coveredInWarranty"
                          className="form-control"
                          placeholder="Covered in Warranty"
                          value={form.coveredInWarranty}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3 col-md-4">
                        <input
                          type="text"
                          name="notCoveredInWarranty"
                          className="form-control"
                          placeholder="Not Covered in Warranty"
                          value={form.notCoveredInWarranty}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Details Tab */}
              {activeTab === "details" && (
                <div className="tab-pane fade show active">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-globe me-2"></i>Country of Origin
                      </label>
                      <input
                        type="text"
                        name="countryOfOrigin"
                        className="form-control form-control-lg"
                        value={form.countryOfOrigin || ""}
                        onChange={handleChange}
                        placeholder="Enter country"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-industry me-2"></i>Manufacturer
                      </label>
                      <input
                        type="text"
                        name="manufacturer"
                        className="form-control form-control-lg"
                        value={form.manufacturer || ""}
                        onChange={handleChange}
                        placeholder="Enter manufacturer name"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-weight me-2"></i>Weight (kg)
                      </label>
                      <input
                        type="number"
                        name="weight"
                        className="form-control form-control-lg"
                        value={form.weight || ""}
                        onChange={handleChange}
                        placeholder="0.0"
                        step="0.1"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-ruler me-2"></i>Length (cm)
                      </label>
                      <input
                        type="number"
                        name="length"
                        className="form-control form-control-lg"
                        value={form.length || ""}
                        onChange={handleChange}
                        placeholder="0"
                        step="0.1"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-ruler me-2"></i>Width (cm)
                      </label>
                      <input
                        type="number"
                        name="width"
                        className="form-control form-control-lg"
                        value={form.width || ""}
                        onChange={handleChange}
                        placeholder="0"
                        step="0.1"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-ruler me-2"></i>Height (cm)
                      </label>
                      <input
                        type="number"
                        name="height"
                        className="form-control form-control-lg"
                        value={form.height || ""}
                        onChange={handleChange}
                        placeholder="0"
                        step="0.1"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-palette me-2"></i>Color
                      </label>
                      <input
                        type="text"
                        name="color"
                        className="form-control form-control-lg"
                        value={form.color || ""}
                        onChange={handleChange}
                        placeholder="Enter color"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-expand-arrows-alt me-2"></i>Size
                      </label>
                      <input
                        type="text"
                        name="size"
                        className="form-control form-control-lg"
                        value={form.size || ""}
                        onChange={handleChange}
                        placeholder="Enter size"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-certificate me-2"></i>Warranty
                      </label>
                      <input
                        type="text"
                        name="warranty"
                        className="form-control form-control-lg"
                        value={form.warranty || ""}
                        onChange={handleChange}
                        placeholder="e.g., 1 year warranty"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-star me-2"></i>Material
                      </label>
                      <input
                        type="text"
                        name="material"
                        className="form-control form-control-lg"
                        value={form.material || ""}
                        onChange={handleChange}
                        placeholder="Enter material"
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-tags me-2"></i>Tags
                      </label>
                      <input
                        type="text"
                        name="tags"
                        className="form-control form-control-lg"
                        value={form.tags || ""}
                        onChange={handleChange}
                        placeholder="Enter tags separated by commas"
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-info-circle me-2"></i>Additional
                        Information
                      </label>
                      <textarea
                        name="additionalInfo"
                        rows="4"
                        className="form-control"
                        value={form.additionalInfo || ""}
                        onChange={handleChange}
                        placeholder="Enter any additional product information"
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}
              <div className="d-flex justify-content-between mt-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate("/products")}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProduct;
