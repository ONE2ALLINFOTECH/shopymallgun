import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProductUpload.css";
import { Form, Row, Col, Button, Alert, Modal } from "react-bootstrap";
import Dashboard from "../pages/Dashboard"
import api from "../api/api"



function ProductUpload() {
  const [form, setForm] = useState({
    name: "",
    sku: "",
   price:"",
    discount: "",
    description: "",
    category: "",
    subcategory: "",
    subsubcategory: "",
    brand: "",
    highlights: "",
    specifications: "",
    offers: "",
    listingStatus: "",
    mrp: "",
    sellingPrice: "",
    minOrderQty: "",
    fulfilmentBy: "",
    procurementType: "",
    procurementSLA: "",
    stock: "",
    shippingProvider: "",

    local: "",
    zonal: "",
    national: "",

    lengthCM: "",
    breadthCM: "",
    heightCM: "",
    weightKG: "",

    hsn: "",
    luxuryCess: "",
    taxCode: "",
    countryOfOrigin: "",
    manufacturerDetails: "",
    packerDetails: "",
    importerDetails: "",
    modelName: "",
    modelNumber: "",
    type: "",
    brandColors: [""],
    maxAge: "",
    minAge: "",
    salesPackages: [""],
    weightCapacity: { value: "", unit: "G" },
    material: "",
    colors: [""],
    carryingPositions: [""],
    ean: "",
    character: "",
    description: "",
    searchKeywords: "",
    keyFeatures: "",
    externalId: "",
    netQuantity: "",
    width: "",
    height: "",
    depth: "",
    weight: "",
    assembledWidth: "",
    assembledHeight: "",
    assembledDepth: "",
    otherDimensions: "",
    wheelType: "",
    legSupport: "",
    headSupport: "",
    otherBodyFeatures: "",
    harnessType: "",
    boxWidth: "",
    boxLength: "",
    boxDepth: "",
    boxWeight: "",
    otherFeatures: "",
    domesticWarranty: "",
    internationalWarranty: "",
    warrantySummary: "",
    warrantyServiceType: "",
    coveredInWarranty: "",
    notCoveredInWarranty: "",
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [video, setVideo] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [subsubcategories,setSubsubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [skuError, setSkuError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [searchSKU, setSearchSKU] = useState("");
  const [searchedProduct, setSearchedProduct] = useState(null);
  const [searchError, setSearchError] = useState("");

  // Loading states
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Alert states
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
 useEffect(() => {
    const mrp = parseFloat(form.mrp) || 0;
    const discount = parseFloat(form.discount) || 0;
    const calculated = mrp - (mrp * discount) / 100;
    setForm(prev => ({
      ...prev,
      sellingPrice: calculated.toFixed(2),
    }));
  }, [form.mrp, form.discount]);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
         api.get("/category"),
api.get("/brand"),
        ]);
        setCategories(categoriesRes.data);
        setBrands(brandsRes.data);
      } catch (error) {
        showAlert("Failed to load categories and brands", "danger");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch subcategories when category changes (for both form and searched product)
  useEffect(() => {
    const fetchSubcategories = async () => {
      const categoryId = form.category || searchedProduct?.category?._id;
      if (categoryId) {
        try {
          const res = await api.get(
            `/subcategory/${categoryId}`
          );
          setSubcategories(res.data);
        } catch (error) {
          setSubcategories([]);
          showAlert("Failed to load subcategories", "warning");
        }
      } else {
        setSubcategories([]);
      }
    };

    fetchSubcategories();
  }, [form.category, searchedProduct?.category?._id]);
// Fetch subsubcategories when subcategory changes
useEffect(() => {
  const fetchSubsubcategories = async () => {
    const subcategoryId = form.subcategory || searchedProduct?.subcategory?._id;
    if (subcategoryId) {
      try {
        const res = await api.get(
          `/subsubcategory/${subcategoryId}`
        );
        setSubsubcategories(res.data);
      } catch (error) {
        setSubsubcategories([]);
        showAlert("Failed to load subsubcategories", "warning");
      }
    } else {
      setSubsubcategories([]);
    }
  };

  fetchSubsubcategories();
}, [form.subcategory, searchedProduct?.subcategory?._id]);

  // Show alert helper
  const showAlert = (message, type = "info") => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: "", type: "" });
    }, 5000);
  };

  // Handle nested fields
  /* if (name.includes("deliveryCharges.")) {
      const key = name.split(".")[1];
      return {
        ...prev,
        deliveryCharges: {
          local: "",
          zonal: "",
          national: "",
          ...(prev.deliveryCharges || {}),
          [key]: value,
        },
      };
    }  else {
      // Simple field
      return {
        ...prev,
        [name]: value,
      };
    }
  });
};*/

  /*  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear SKU error when user starts typing
    if (name === "sku" && skuError) {
      setSkuError("");
    }
  };
*/

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special case for weight capacity
    if (name === "weightValue" || name === "weightUnit") {
      setForm((prev) => ({
        ...prev,
        weightCapacity: {
          ...prev.weightCapacity,
          [name === "weightValue" ? "value" : "unit"]: value,
        },
      }));
      return;
    }

    // Normal field update
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear SKU error when user starts typing
    if (name === "sku" && skuError) {
      setSkuError("");
    }
  };

  // Check if SKU already exists
  const handleSKUCheck = async () => {
    if (!form.sku || editMode) return;

    try {
      const res = await api.post(
        "/products/sku-check",
        {
          sku: form.sku,
        }
      );

      if (res.data.exists) {
        setSkuError("This SKU ID already exists, please enter a new SKU ID");
      } else {
        setSkuError("");
      }
    } catch (error) {
      setSkuError("Error checking SKU");
      console.error("SKU check error:", error);
    }
  };

  // Handle file uploads
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showAlert("Thumbnail size should be less than 5MB", "warning");
        return;
      }
      setThumbnail(file);
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate file count (max 10 images)
    if (files.length > 10) {
      showAlert("Maximum 10 gallery images allowed", "warning");
      return;
    }

    // Validate file sizes
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      showAlert("Some images are larger than 5MB", "warning");
      return;
    }

    setGallery(files);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        showAlert("Video size should be less than 50MB", "warning");
        return;
      }
      setVideo(file);
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = [];

    if (!form.name.trim()) errors.push("Product name is required");
    if (!form.sku.trim()) errors.push("SKU is required");
    if (!form.price || form.price <= 0) errors.push("Valid price is required");
    if (!form.category) errors.push("Category is required");
    if (!form.subcategory) errors.push("Subcategory is required");
    if (!form.brand) errors.push("Brand is required");
    if (skuError) errors.push(skuError);

    if (errors.length > 0) {
      showAlert(errors.join(", "), "danger");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setUploading(true);

    try {
      const formData = new FormData();

      // Append files
      if (thumbnail) formData.append("thumbnail", thumbnail);
      if (gallery.length > 0) {
        gallery.forEach((img) => formData.append("gallery", img));
      }
      if (video) formData.append("video", video);

      // Prepare form data
      const data = {
        ...form,
        price: parseFloat(form.price),
        discount: form.discount ? parseFloat(form.discount) : 0,
        highlights: form.highlights
          ? form.highlights
              .split(",")
              .map((h) => h.trim())
              .filter((h) => h)
          : [],
        offers: form.offers
          ? form.offers
              .split(",")
              .map((o) => o.trim())
              .filter((o) => o)
          : [],
        specifications: form.specifications
          ? Object.fromEntries(
              form.specifications
                .split(",")
                .map((pair) => pair.split(":"))
                .filter(([key, value]) => key && value)
                .map(([key, value]) => [key.trim(), value.trim()])
            )
          : {},
      };

      formData.append("data", JSON.stringify(data));

      let response;
      if (editMode) {
        response = await api.put(
          `/products/${editId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        showAlert("Product updated successfully!", "success");
      } else {
        response = await api.post(
          "/products",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        showAlert("Product created successfully!", "success");
      }

      // Reset form after successful submission
      resetForm();
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Upload failed. Please try again.";
      showAlert(errorMessage, "danger");
    } finally {
      setUploading(false);
    }
  };

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

  // Reset form to initial state
  const resetForm = () => {
    setForm({
      name: "",
      sku: "",
      price: "",
      discount: "",
      description: "",
      category: "",
      subcategory: "",
      brand: "",
      highlights: "",
      specifications: "",
      offers: "",
      listingStatus: "",
      mrp: "",
      sellingPrice: "",
      minOrderQty: "",
      fulfilmentBy: "",
      procurementType: "",
      procurementSLA: "",
      stock: "",
      shippingProvider: "",

      local: "",
      zonal: "",
      national: "",

      lengthCM: "",
      breadthCM: "",
      heightCM: "",
      weightKG: "",

      hsn: "",
      luxuryCess: "",
      taxCode: "",
      countryOfOrigin: "",
      manufacturerDetails: "",
      packerDetails: "",
      importerDetails: "",
      modelName: "",
      modelNumber: "",
      type: "",
      brandColors: [""], // ⭐ YE MISSING THA
      maxAge: "",
      minAge: "",
      salesPackages: [""], // ⭐ YE MISSING THA
      weightCapacity: { value: "", unit: "G" }, // ⭐ YE MISSING THA
      material: "",
      colors: [""], // ⭐ YE MISSING THA
      carryingPositions: [""], // ⭐ YE MISSING THA
    });

    setThumbnail(null);
    setGallery([]);
    setVideo(null);
    setEditMode(false);
    setEditId(null);
    setSearchedProduct(null);
    setSearchSKU("");
    setSkuError("");

    // Reset file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input) => (input.value = ""));
  };

  // Handle product search
  const handleSearch = async () => {
    if (!searchSKU.trim()) {
      showAlert("Please enter SKU ID to search", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(
        `/products/sku/${searchSKU}`
      );
      setSearchedProduct(res.data);
      setSearchError("");
      showAlert("Product found successfully!", "success");
    } catch (error) {
      setSearchedProduct(null);
      setSearchError("Product not found with this SKU ID");
      showAlert("Product not found with this SKU ID", "warning");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    setForm({
      name: product.name || "",
      sku: product.sku || "",
      price: product.price || "",
      discount: product.discount || "",
      description: product.description || "",
      category: product.category?._id || "",
      subcategory: product.subcategory?._id || "",
      brand: product.brand?._id || "",
      highlights: product.highlights?.join(",") || "",
      specifications: Object.entries(product.specifications || {})
        .map(([k, v]) => `${k}:${v}`)
        .join(","),
      offers: product.offers?.join(",") || "",
    });

    // Reset file inputs for edit mode
    setThumbnail(null);
    setGallery([]);
    setVideo(null);

    setEditMode(true);
    setEditId(product._id);

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
    showAlert("Product loaded for editing", "info");
  };

  // Handle delete product
  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setLoading(true);
    try {
      await api.delete(
        `/products/${productToDelete._id}`
      );
      showAlert("Product deleted successfully!", "success");
      setSearchedProduct(null);
      setSearchSKU("");
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      showAlert("Error deleting product", "danger");
    } finally {
      setLoading(false);
    }
  };

  // Cancel edit mode
  const cancelEdit = () => {
    resetForm();
    showAlert("Edit cancelled", "info");
  };

  // Update searched product fields
  const updateSearchedProduct = (field, value) => {
    setSearchedProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle direct update from search results
  const handleDirectUpdate = async (e, productId) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formData = new FormData();

      // Prepare updated data
      const data = {
        name: searchedProduct.name,
        price: parseFloat(searchedProduct.price),
        discount: searchedProduct.discount
          ? parseFloat(searchedProduct.discount)
          : 0,
        description: searchedProduct.description,
        category: searchedProduct.category?._id || searchedProduct.category,
        subcategory:
          searchedProduct.subcategory?._id || searchedProduct.subcategory,
        brand: searchedProduct.brand?._id || searchedProduct.brand,
        highlights:
          typeof searchedProduct.highlights === "string"
            ? searchedProduct.highlights
                .split(",")
                .map((h) => h.trim())
                .filter((h) => h)
            : searchedProduct.highlights || [],
        offers:
          typeof searchedProduct.offers === "string"
            ? searchedProduct.offers
                .split(",")
                .map((o) => o.trim())
                .filter((o) => o)
            : searchedProduct.offers || [],
        specifications:
          typeof searchedProduct.specifications === "string"
            ? Object.fromEntries(
                searchedProduct.specifications
                  .split(",")
                  .map((pair) => pair.split(":"))
                  .filter(([key, value]) => key && value)
                  .map(([key, value]) => [key.trim(), value.trim()])
              )
            : searchedProduct.specifications || {},
      };

      formData.append("data", JSON.stringify(data));

      await api.put(
        `/products/${productId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      showAlert("Product updated successfully!", "success");

      // Refresh the searched product data
      const updatedRes = await api.get(
        `/products/sku/${searchedProduct.sku}`
      );
      setSearchedProduct(updatedRes.data);
    } catch (error) {
      console.error("Update error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Update failed. Please try again.";
      showAlert(errorMessage, "danger");
    } finally {
      setUploading(false);
    }
  };

  // Handle image/video updates
  const handleImageUpdate = async (type, files, productId) => {
    if (!files) return;

    setUploading(true);
    try {
      const formData = new FormData();

      if (type === "thumbnail" && files) {
        formData.append("thumbnail", files);
      } else if (type === "gallery" && files.length > 0) {
        files.forEach((file) => formData.append("gallery", file));
      } else if (type === "video" && files) {
        formData.append("video", files);
      }

      await api.put(
        `/products/${productId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      showAlert(
        `${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`,
        "success"
      );

      // Refresh the searched product data
      const updatedRes = await api.get(
        `/products/sku/${searchedProduct.sku}`
      );
      setSearchedProduct(updatedRes.data);
    } catch (error) {
      console.error("Media update error:", error);
      showAlert(`Failed to update ${type}`, "danger");
    } finally {
      setUploading(false);
    }
  };

  // Remove gallery image
  const removeGalleryImage = async (imageIndex, productId) => {
    if (!window.confirm("Are you sure you want to remove this image?")) return;

    setUploading(true);
    try {
      await api.delete(
        `/products/${productId}/gallery/${imageIndex}`
      );

      showAlert("Gallery image removed successfully!", "success");

      // Refresh the searched product data
      const updatedRes = await api.get(
        `/products/sku/${searchedProduct.sku}`
      );
      setSearchedProduct(updatedRes.data);
    } catch (error) {
      console.error("Remove image error:", error);
      showAlert("Failed to remove image", "danger");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
  <Dashboard />
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{editMode ? "Update Product" : "Upload Product"}</h2>
        {editMode && (
          <Button variant="secondary" onClick={cancelEdit}>
            Cancel Edit
          </Button>
        )}
      </div>

      {/* Alert */}
      {alert.show && (
        <Alert
          variant={alert.type}
          dismissible
          onClose={() => setAlert({ show: false, message: "", type: "" })}
        >
          {alert.message}
        </Alert>
      )}

      {/* Search Section */}
      <div className="mb-4 p-3 bg-light rounded">
        <h5>Search Product by SKU</h5>
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter SKU ID to search"
            value={searchSKU}
            onChange={(e) => setSearchSKU(e.target.value)}
            className="form-control"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button
            variant="outline-primary"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

        {searchError && <p className="text-danger mt-2">{searchError}</p>}

        {/* Search Results - Editable Form */}
        {searchedProduct && (
          <div className="mt-3 border p-3 bg-white rounded">
            <h6>Product Details - Direct Edit:</h6>
            <form onSubmit={(e) => handleDirectUpdate(e, searchedProduct._id)}>
              <div className="row">
                {/* SKU - Non-editable */}
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">SKU</label>
                  <input
                    type="text"
                    value={searchedProduct.sku}
                    className="form-control"
                    disabled
                    style={{ backgroundColor: "#f8f9fa" }}
                  />
                  <small className="text-muted">SKU cannot be changed</small>
                </div>

                {/* Product Name */}
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Product Name</label>
                  <input
                    type="text"
                    value={searchedProduct.name || ""}
                    onChange={(e) =>
                      updateSearchedProduct("name", e.target.value)
                    }
                    className="form-control"
                    placeholder="Enter product name"
                  />
                </div>

                {/* Price */}
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={searchedProduct.price || ""}
                    onChange={(e) =>
                      updateSearchedProduct("price", e.target.value)
                    }
                    className="form-control"
                    placeholder="Enter price"
                  />
                </div>

                {/* Discount */}
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={searchedProduct.discount || ""}
                    onChange={(e) =>
                      updateSearchedProduct("discount", e.target.value)
                    }
                    className="form-control"
                    placeholder="Enter discount"
                  />
                </div>

                {/* Description */}
                <div className="col-md-8 mb-3">
                  <label className="form-label fw-bold">Description</label>
                  <textarea
                    value={searchedProduct.description || ""}
                    onChange={(e) =>
                      updateSearchedProduct("description", e.target.value)
                    }
                    className="form-control"
                    rows="3"
                    placeholder="Enter description"
                  />
                </div>

                {/* Category */}
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Category</label>
                  <select
                    value={searchedProduct.category?._id || ""}
                    onChange={(e) =>
                      updateSearchedProduct("category", e.target.value)
                    }
                    className="form-control"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Subcategory</label>
                  <select
                    value={searchedProduct.subcategory?._id || ""}
                    onChange={(e) =>
                      updateSearchedProduct("subcategory", e.target.value)
                    }
                    className="form-control"
                    disabled={!searchedProduct.category?._id}
                  >
                    <option value="">Select Subcategory</option>
                    {subcategories.map((sc) => (
                      <option key={sc._id} value={sc._id}>
                        {sc.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Brand</label>
                  <select
                    value={searchedProduct.brand?._id || ""}
                    onChange={(e) =>
                      updateSearchedProduct("brand", e.target.value)
                    }
                    className="form-control"
                  >
                    <option value="">Select Brand</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Highlights */}
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Highlights</label>
                  <textarea
                    value={searchedProduct.highlights?.join(", ") || ""}
                    onChange={(e) =>
                      updateSearchedProduct("highlights", e.target.value)
                    }
                    className="form-control"
                    rows="3"
                    placeholder="Enter highlights (comma separated)"
                  />
                </div>

                {/* Offers */}
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Offers</label>
                  <textarea
                    value={searchedProduct.offers?.join(", ") || ""}
                    onChange={(e) =>
                      updateSearchedProduct("offers", e.target.value)
                    }
                    className="form-control"
                    rows="3"
                    placeholder="Enter offers (comma separated)"
                  />
                </div>

                {/* Specifications */}
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Specifications</label>
                  <textarea
                    value={
                      searchedProduct.specifications
                        ? Object.entries(searchedProduct.specifications)
                            .map(([key, value]) => `${key}:${value}`)
                            .join(", ")
                        : ""
                    }
                    onChange={(e) =>
                      updateSearchedProduct("specifications", e.target.value)
                    }
                    className="form-control"
                    rows="3"
                    placeholder="Format: Color:Red, Size:Large"
                  />
                </div>

                {/* Current Images Display */}
                <div className="col-12 mb-3">
                  <div className="row">
                    {/* Thumbnail */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold">
                        Current Thumbnail
                      </label>
                      <div className="border p-2 rounded">
                        {searchedProduct.thumbnail?.url ? (
                          <div className="text-center">
                            <img
                              src={searchedProduct.thumbnail.url}
                              alt="Thumbnail"
                              style={{
                                width: "150px",
                                height: "150px",
                                objectFit: "cover",
                              }}
                              className="rounded mb-2"
                            />
                            <br />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleImageUpdate(
                                  "thumbnail",
                                  e.target.files[0],
                                  searchedProduct._id
                                )
                              }
                              className="form-control form-control-sm"
                            />
                            <small className="text-muted">
                              Upload new thumbnail
                            </small>
                          </div>
                        ) : (
                          <div className="text-center">
                            <p>No thumbnail</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleImageUpdate(
                                  "thumbnail",
                                  e.target.files[0],
                                  searchedProduct._id
                                )
                              }
                              className="form-control form-control-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Gallery */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold">
                        Current Gallery
                      </label>
                      <div
                        className="border p-2 rounded"
                        style={{ maxHeight: "200px", overflowY: "auto" }}
                      >
                        {searchedProduct.gallery?.length ? (
                          <div className="d-flex flex-wrap gap-2 mb-2">
                            {searchedProduct.gallery.map((img, idx) => (
                              <div key={idx} className="position-relative">
                                <img
                                  src={img.url}
                                  alt={`gallery-${idx}`}
                                  style={{
                                    width: "60px",
                                    height: "60px",
                                    objectFit: "cover",
                                  }}
                                  className="rounded"
                                />
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm position-absolute top-0 end-0"
                                  style={{
                                    fontSize: "10px",
                                    padding: "2px 4px",
                                  }}
                                  onClick={() =>
                                    removeGalleryImage(idx, searchedProduct._id)
                                  }
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted">No gallery images</p>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) =>
                            handleImageUpdate(
                              "gallery",
                              Array.from(e.target.files),
                              searchedProduct._id
                            )
                          }
                          className="form-control form-control-sm"
                        />
                        <small className="text-muted">
                          Add more gallery images
                        </small>
                      </div>
                    </div>

                    {/* Video */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-bold">
                        Current Video
                      </label>
                      <div className="border p-2 rounded">
                        {searchedProduct.video?.url ? (
                          <div className="text-center">
                            <video
                              width="150"
                              controls
                              className="rounded mb-2"
                            >
                              <source
                                src={searchedProduct.video.url}
                                type="video/mp4"
                              />
                              Your browser does not support the video tag.
                            </video>
                            <br />
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) =>
                                handleImageUpdate(
                                  "video",
                                  e.target.files[0],
                                  searchedProduct._id
                                )
                              }
                              className="form-control form-control-sm"
                            />
                            <small className="text-muted">
                              Upload new video
                            </small>
                          </div>
                        ) : (
                          <div className="text-center">
                            <p>No video</p>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) =>
                                handleImageUpdate(
                                  "video",
                                  e.target.files[0],
                                  searchedProduct._id
                                )
                              }
                              className="form-control form-control-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="col-12">
                  <div className="d-flex gap-2 justify-content-center">
                    <Button
                      type="submit"
                      variant="success"
                      disabled={uploading}
                    >
                      {uploading ? "Updating..." : "Save Changes"}
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setSearchedProduct(null);
                        setSearchSKU("");
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => handleDeleteProduct(searchedProduct)}
                    >
                      Delete Product
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Product Form */}
      <form onSubmit={handleSubmit}>
        <div className="row">
           {/* Category */}
          <div className="col-md-12 mb-3">
            <label className="form-label">Verticals *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {/* SKU */}
          <div className="col-md-6 mb-3">
            <label className="form-label">SKU (Unique) *</label>
            <input
              name="sku"
              value={form.sku}
              onChange={handleChange}
              onBlur={handleSKUCheck}
              placeholder="Enter unique SKU"
              required
              className={`form-control ${skuError ? "is-invalid" : ""}`}
              disabled={editMode}
            />
            {skuError && <div className="invalid-feedback">{skuError}</div>}
          </div>

          {/* Product Name */}
          <div className="col-md-6 mb-3">
            <label className="form-label">Product Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter product name"
              required
              className="form-control"
            />
          </div>

          {/* Price */}
        <div className="col-md-4 mb-3">
            <label className="form-label">Price *</label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={handleChange}
              placeholder="Enter price"
              required
              className="form-control"
            />
          </div> 

        

         

          {/* Subcategory */}
          <div className="col-md-4 mb-3">
            <label className="form-label">category *</label>
            <select
              name="subcategory"
              value={form.subcategory}
              onChange={handleChange}
              className="form-control"
              required
              disabled={!form.category}
            >
              <option value="">Select category</option>
              {subcategories.map((sc) => (
                <option key={sc._id} value={sc._id}>
                  {sc.name}
                </option>
              ))}
            </select>
          </div>
<div className="mb-3 col-md-4">
  <label htmlFor="subsubcategory" className="form-label"> Sub category</label>
  <select
    className="form-select"
    name="subsubcategory"
    value={form.subsubcategory}
    onChange={handleChange}
  >
    <option value="">Select Sub category</option>
    {subsubcategories.map((subsub) => (
      <option key={subsub._id} value={subsub._id}>
        {subsub.name}
      </option>
    ))}
  </select>
</div>
          {/* Brand */}
          <div className="col-md-4 mb-3">
            <label className="form-label">Brand *</label>
            <select
              name="brand"
              value={form.brand}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">Select Brand</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="col-md-12 mb-3">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter product description"
              className="form-control"
              rows="3"
            />
          </div>

          {/* Thumbnail */}
          <div className="col-md-4 mb-3">
            <label className="form-label">Thumbnail Image</label>
            <input
              type="file"
              onChange={handleThumbnailChange}
              accept="image/*"
              className="form-control"
            />
            <small className="text-muted">Max size: 5MB</small>
          </div>

          {/* Gallery */}
          <div className="col-md-4 mb-3">
            <label className="form-label">Gallery Images</label>
            <input
              type="file"
              onChange={handleGalleryChange}
              accept="image/*"
              multiple
              className="form-control"
            />
            <small className="text-muted">Max 10 images, 5MB each</small>
          </div>

          {/* Video */}
          <div className="col-md-4 mb-3">
            <label className="form-label">Product Video</label>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="form-control"
            />
            <small className="text-muted">Max size: 50MB</small>
          </div>

          {/* Highlights */}
          <div className="col-md-4 mb-3">
            <label className="form-label">Highlights</label>
            <textarea
              name="highlights"
              value={form.highlights}
              onChange={handleChange}
              placeholder="Enter highlights (comma separated)"
              className="form-control"
              rows="3"
            />
            <small className="text-muted">
              Separate each highlight with comma
            </small>
          </div>

          {/* Offers */}
          <div className="col-md-4 mb-3">
            <label className="form-label">Offers</label>
            <textarea
              name="offers"
              value={form.offers}
              onChange={handleChange}
              placeholder="Enter offers (comma separated)"
              className="form-control"
              rows="3"
            />
            <small className="text-muted">Separate each offer with comma</small>
          </div>

          {/* Specifications */}
          <div className="col-md-4 mb-3">
            <label className="form-label">Specifications</label>
            <textarea
              name="specifications"
              value={form.specifications}
              onChange={handleChange}
              placeholder="Enter specifications (key:value, comma separated)"
              className="form-control"
              rows="3"
            />
            <small className="text-muted">
              Format: Color:Red, Size:Large, Weight:2kg
            </small>
          </div>
          <Form.Group className="mb-3 ">
            <Form.Label>Listing Status *</Form.Label>
            <Form.Select
              name="listingStatus"
              value={form.listingStatus}
              onChange={handleChange}
              required
            >
              <option value="">Select One</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Form.Select>
          </Form.Group>

          <h5 className="mt-4 ">Price Details</h5>
          <Form.Group className="mb-3 col-md-4">
            <Form.Label>MRP *</Form.Label>
            <Form.Control
              name="mrp"
              type="number"
              value={form.mrp}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3 col-md-4">
            <Form.Label>Your Selling Price *</Form.Label>
            <Form.Control
              name="sellingPrice"
              type="number"
              value={form.sellingPrice}
              onChange={handleChange}
              required
            />
          </Form.Group>
            {/* Discount */}
          <div className="col-md-4 mb-3">
            <label className="form-label">Discount (%)</label>
            <input
              name="discount"
              type="number"
              min="0"
              max="100"
              value={form.discount}
              onChange={handleChange}
              placeholder="Enter discount percentage"
              className="form-control"
            />
          </div>
          <Form.Group className="mb-3">
            <Form.Label>Minimum Order Quantity</Form.Label>
            <Form.Control
              name="minOrderQty"
              type="number"
              value={form.minOrderQty}
              onChange={handleChange}
            />
          </Form.Group>

          <h5 className="mt-4">Inventory Details</h5>
          <Form.Group className="mb-3">
            <Form.Label>Fulfilment by *</Form.Label>
            <Form.Select
              name="fulfilmentBy"
              value={form.fulfilmentBy}
              onChange={handleChange}
              required
            >
              <option value="">Select One</option>
              <option value="seller">Seller</option>
              <option value="marketplace">Marketplace</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Procurement Type</Form.Label>
            <Form.Select
              name="procurementType"
              value={form.procurementType}
              onChange={handleChange}
            >
              <option value="">Select One</option>
              <option value="made_to_order">Made to Order</option>
              <option value="stock">Stock</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Procurement SLA (Days) *</Form.Label>
            <Form.Control
              name="procurementSLA"
              type="number"
              value={form.procurementSLA}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Stock *</Form.Label>
            <Form.Control
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Shippingprovider</Form.Label>
            <Form.Control
              name="shippingProvider"
              value={form.shippingProvider}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <h5 className="mt-4">Shipping Charges</h5>
          <Form.Group className="mb-3">
            <Form.Label>Local</Form.Label>
            <Form.Control
              type="text"
              name="local"
              value={form.local}
              onChange={handleChange}
              placeholder="Local delivery charge"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Zonal</Form.Label>
            <Form.Control
              type="text"
              name="zonal"
              value={form.zonal}
              onChange={handleChange}
              placeholder="Zonal delivery charge"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>National</Form.Label>
            <Form.Control
              type="text"
              name="national"
              value={form.national}
              onChange={handleChange}
              placeholder="National delivery charge"
            />
          </Form.Group>
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Length (cm)</Form.Label>
                <Form.Control
                  name="lengthCM"
                  type="number"
                  value={form.lengthCM}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Breadth (cm)</Form.Label>
                <Form.Control
                  name="breadthCM"
                  type="number"
                  value={form.breadthCM}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Height (cm)</Form.Label>
                <Form.Control
                  name="heightCM"
                  type="number"
                  value={form.heightCM}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Weight (kg)</Form.Label>
                <Form.Control
                  name="weightKG"
                  type="number"
                  value={form.weightKG}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <h5 className="mt-4">Tax Info</h5>
          <Form.Group className="mb-3">
            <Form.Label>HSN Code *</Form.Label>
            <Form.Control
              name="hsn"
              value={form.hsn}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Luxury Cess (%)</Form.Label>
            <Form.Control
              name="luxuryCess"
              type="number"
              value={form.luxuryCess}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Tax Code *</Form.Label>
            <Form.Select
              name="taxCode"
              value={form.taxCode}
              onChange={handleChange}
              required
            >
              <option value="">Select One</option>
              <option value="GST5">GST 5%</option>
              <option value="GST12">GST 12%</option>
              <option value="GST18">GST 18%</option>
            </Form.Select>
          </Form.Group>

          <h5 className="mt-4">Manufacturing Info</h5>
          <Form.Group className="mb-3">
            <Form.Label>Country of Origin *</Form.Label>
            <Form.Select
              name="countryOfOrigin"
              value={form.countryOfOrigin}
              onChange={handleChange}
              required
            >
              <option value="">Select One</option>
              <option value="IN">India</option>
              <option value="CN">China</option>
              <option value="US">United States</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Manufacturer *</Form.Label>
            <Form.Control
              name="manufacturerDetails"
              value={form.manufacturerDetails}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Packer *</Form.Label>
            <Form.Control
              name="packerDetails"
              value={form.packerDetails}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Importer</Form.Label>
            <Form.Control
              name="importerDetails"
              value={form.importerDetails}
              onChange={handleChange}
            />
          </Form.Group>

          <div className="mb-3">
            <label className="form-label">Model Name</label>
            <input
              type="text"
              className="form-control"
              name="modelName"
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Model Number</label>
            <input
              type="text"
              className="form-control"
              name="modelNumber"
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Type</label>
            <select className="form-select" name="type" onChange={handleChange}>
              <option value="">Select One</option>
              <option value="Type 1">Type 1</option>
              <option value="Type 2">Type 2</option>
            </select>
          </div>

          <label className="form-label fw-bold">Brand Color</label>
          {form.brandColors.map((color, idx) => (
            <div key={idx} className="d-flex mb-2">
              <input
                type="text"
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

          {/* Age */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Maximum Age (Month)</label>
              <input
                type="number"
                name="maxAge"
                className="form-control"
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Minimum Age (Month)</label>
              <input
                type="number"
                name="minAge"
                className="form-control"
                onChange={handleChange}
              />
            </div>
          </div>
          <label className="form-label fw-bold">Sales Package</label>
          {form.salesPackages.map((item, idx) => (
            <div key={idx} className="d-flex mb-2">
              <input
                type="text"
                className="form-control me-2"
                value={item}
                onChange={(e) =>
                  handleArrayChange(idx, "salesPackages", e.target.value)
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
              <label className="form-label">Weight Capacity</label>
              <div className="d-flex">
                <input
                  type="number"
                  className="form-control me-2"
                  name="weightValue"
                  onChange={handleChange}
                />
                <select
                  className="form-select w-auto"
                  name="weightUnit"
                  onChange={handleChange}
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
              onChange={handleChange}
            >
              <option value="">Select One</option>
              <option value="Plastic">Plastic</option>
              <option value="Metal">Metal</option>
            </select>
          </div>

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

          <label className="form-label fw-bold">Carrying Positions</label>
          {form.carryingPositions.map((pos, idx) => (
            <div key={idx} className="d-flex mb-2">
              <select
                className="form-select me-2"
                value={pos}
                onChange={(e) =>
                  handleArrayChange(idx, "carryingPositions", e.target.value)
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

          <h5>General</h5>
          <input
            type="text"
            name="ean"
            className="form-control mb-2"
            placeholder="EAN/UPC"
            onChange={handleChange}
          />
          <input
            type="text"
            name="character"
            className="form-control mb-2"
            placeholder="Character"
            onChange={handleChange}
          />
          <input
            type="text"
            name="description"
            className="form-control mb-2"
            placeholder="Description"
            onChange={handleChange}
          />
          <input
            type="text"
            name="searchKeywords"
            className="form-control mb-2"
            placeholder="Search Keywords"
            onChange={handleChange}
          />
          <input
            type="text"
            name="keyFeatures"
            className="form-control mb-2"
            placeholder="Key Features"
            onChange={handleChange}
          />
          <input
            type="text"
            name="externalId"
            className="form-control mb-2"
            placeholder="External Identifier"
            onChange={handleChange}
          />
          <input
            type="text"
            name="netQuantity"
            className="form-control mb-2"
            placeholder="Net Quantity"
            onChange={handleChange}
          />

          <h5>Dimensions</h5>
          <input
            type="text"
            name="width"
            className="form-control mb-2"
            placeholder="Width (cm)"
            onChange={handleChange}
          />
          <input
            type="text"
            name="height"
            className="form-control mb-2"
            placeholder="Height (cm)"
            onChange={handleChange}
          />
          <input
            type="text"
            name="depth"
            className="form-control mb-2"
            placeholder="Depth (cm)"
            onChange={handleChange}
          />
          <input
            type="text"
            name="weight"
            className="form-control mb-2"
            placeholder="Weight (g)"
            onChange={handleChange}
          />
          <input
            type="text"
            name="assembledWidth"
            className="form-control mb-2"
            placeholder="Assembled Width (cm)"
            onChange={handleChange}
          />
          <input
            type="text"
            name="assembledHeight"
            className="form-control mb-2"
            placeholder="Assembled Height (cm)"
            onChange={handleChange}
          />
          <input
            type="text"
            name="assembledDepth"
            className="form-control mb-2"
            placeholder="Assembled Depth (cm)"
            onChange={handleChange}
          />
          <input
            type="text"
            name="otherDimensions"
            className="form-control mb-2"
            placeholder="Other Dimensions"
            onChange={handleChange}
          />

          <h5>Body Features</h5>
          <input
            type="text"
            name="wheelType"
            className="form-control mb-2"
            placeholder="Wheel Type"
            onChange={handleChange}
          />
          <input
            type="text"
            name="legSupport"
            className="form-control mb-2"
            placeholder="Leg Support"
            onChange={handleChange}
          />
          <input
            type="text"
            name="headSupport"
            className="form-control mb-2"
            placeholder="Head Support"
            onChange={handleChange}
          />
          <input
            type="text"
            name="otherBodyFeatures"
            className="form-control mb-2"
            placeholder="Other Body Features"
            onChange={handleChange}
          />

          <h5>Safety Features</h5>
          <input
            type="text"
            name="harnessType"
            className="form-control mb-2"
            placeholder="Harness Type"
            onChange={handleChange}
          />

          <h5>Box Dimensions</h5>
          <input
            type="text"
            name="boxWidth"
            className="form-control mb-2"
            placeholder="Box Width (cm)"
            onChange={handleChange}
          />
          <input
            type="text"
            name="boxLength"
            className="form-control mb-2"
            placeholder="Box Length (cm)"
            onChange={handleChange}
          />
          <input
            type="text"
            name="boxDepth"
            className="form-control mb-2"
            placeholder="Box Depth (cm)"
            onChange={handleChange}
          />
          <input
            type="text"
            name="boxWeight"
            className="form-control mb-2"
            placeholder="Box Weight (kg)"
            onChange={handleChange}
          />

          <h5>Additional Features</h5>
          <input
            type="text"
            name="otherFeatures"
            className="form-control mb-2"
            placeholder="Other Features"
            onChange={handleChange}
          />

          <h5>Warranty</h5>
          <input
            type="text"
            name="domesticWarranty"
            className="form-control mb-2"
            placeholder="Domestic Warranty"
            onChange={handleChange}
          />
          <input
            type="text"
            name="internationalWarranty"
            className="form-control mb-2"
            placeholder="International Warranty"
            onChange={handleChange}
          />
          <input
            type="text"
            name="warrantySummary"
            className="form-control mb-2"
            placeholder="Warranty Summary"
            onChange={handleChange}
          />
          <input
            type="text"
            name="warrantyServiceType"
            className="form-control mb-2"
            placeholder="Warranty Service Type"
            onChange={handleChange}
          />
          <input
            type="text"
            name="coveredInWarranty"
            className="form-control mb-2"
            placeholder="Covered in Warranty"
            onChange={handleChange}
          />
          <input
            type="text"
            name="notCoveredInWarranty"
            className="form-control mb-2"
            placeholder="Not Covered in Warranty"
            onChange={handleChange}
          />

          {/* Submit Button */}
          <div className="col-12">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={uploading || skuError}
              className="w-100"
            >
              {uploading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  {editMode ? "Updating..." : "Uploading..."}
                </>
              ) : editMode ? (
                "Update Product"
              ) : (
                "Upload Product"
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this product?
          {productToDelete && (
            <div className="mt-2">
              <strong>SKU:</strong> {productToDelete.sku}
              <br />
              <strong>Name:</strong> {productToDelete.name}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
    </>
  );
}

export default ProductUpload;
