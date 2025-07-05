const Product = require("../models/Product");

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { sku } = JSON.parse(req.body.data);
    const existing = await Product.findOne({ sku });
    if (existing) {
      return res
        .status(400)
        .json({
          error: "This SKU ID already exists, please enter a new SKU ID",
        });
    }

    const { thumbnail, gallery, video } = req.files;
    const parsed = JSON.parse(req.body.data);

    const newProduct = new Product({
      ...parsed,
      thumbnail: {
        url: thumbnail[0].path,
        public_id: thumbnail[0].filename,
      },
      gallery: gallery.map((file) => ({
        url: file.path,
        public_id: file.filename,
      })),
      video: video?.[0]
        ? {
            url: video[0].path,
            public_id: video[0].filename,
          }
        : undefined,
    });

    await newProduct.save();
    res.json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ SKU Check endpoint
exports.checkSKUExists = async (req, res) => {
  try {
    const { sku } = req.body;
    const existing = await Product.findOne({ sku });
    res.json({ exists: !!existing }); // true ya false
  } catch (err) {
    res.status(500).json({ error: "SKU check failed" });
  }
};
exports.getProductBySKU = async (req, res) => {
  try {
    const { sku } = req.params;
    const product = await Product.findOne({ sku })
      .populate("category")
      .populate("subcategory")
      .populate("brand");

    if (!product) {
      return res
        .status(404)
        .json({ error: "Product not found with this SKU ID" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Error fetching product by SKU" });
  }
};
// Update product
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Safe parsing
    const parsed = req.body.data ? JSON.parse(req.body.data) : {};
    const { thumbnail, gallery, video } = req.files;

    // Fetch old product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found for update" });
    }
    if (
      parsed.listingStatus &&
      !["active", "inactive"].includes(parsed.listingStatus)
    ) {
      return res
        .status(400)
        .json({ error: "Listing status must be 'active' or 'inactive'" });
    }
    if (parsed.minOrderQty !== undefined && parsed.minOrderQty < 0) {
      return res
        .status(400)
        .json({ error: "Minimum Order Quantity cannot be negative" });
    }

    // Update non-file fields
    product.name = parsed.name ?? product.name;
    product.price = parsed.price ?? product.price;
    product.discount = parsed.discount ?? product.discount;
    product.description = parsed.description ?? product.description;

    product.highlights = parsed.highlights ?? product.highlights;
    product.offers = parsed.offers ?? product.offers;
    product.specifications = parsed.specifications ?? product.specifications;
    product.listingStatus = parsed.listingStatus ?? product.listingStatus;
    product.minOrderQty = parsed.minOrderQty ?? product.minOrderQty;
    product.shippingProvider =
      parsed.shippingProvider ?? product.shippingProvider; // ✅ New line
    product.local = parsed.local ?? product.local;
    product.zonal = parsed.zonal ?? product.zonal;
    product.national = parsed.national ?? product.national;
    product.lengthCM = parsed.lengthCM ?? product.lengthCM;
    product.breadthCM = parsed.breadthCM ?? product.breadthCM;
    product.heightCM = parsed.heightCM ?? product.heightCM;
    product.weightKG = parsed.weightKG ?? product.weightKG;
    product.fulfilmentBy = parsed.fulfilmentBy ?? product.fulfilmentBy;
    product.procurementType = parsed.procurementType ?? product.procurementType;
    product.procurementSLA = parsed.procurementSLA ?? product.procurementSLA;
    product.stock = parsed.stock ?? product.stock;
    product.hsn = parsed.hsn ?? product.hsn;
    product.luxuryCess = parsed.luxuryCess ?? product.luxuryCess;
    product.taxCode = parsed.taxCode ?? product.taxCode;
    product.countryOfOrigin = parsed.countryOfOrigin ?? product.countryOfOrigin;
    product.manufacturerDetails =
      parsed.manufacturerDetails ?? product.manufacturerDetails;
    product.packerDetails = parsed.packerDetails ?? product.packerDetails;
    product.importerDetails = parsed.importerDetails ?? product.importerDetails;
    product.modelName = parsed.modelName ?? product.modelName;
    product.modelNumber = parsed.modelNumber ?? product.modelNumber;
    product.type = parsed.type ?? product.type;
    product.brandColors = parsed.brandColors ?? product.brandColors;
    product.maxAge = parsed.maxAge ?? product.maxAge;
    product.minAge = parsed.minAge ?? product.minAge;
    product.salesPackages = parsed.salesPackages ?? product.salesPackages;
    product.weightCapacity = parsed.weightCapacity ?? product.weightCapacity;
    product.material = parsed.material ?? product.material;
    product.colors = parsed.colors ?? product.colors;
    product.carryingPositions =
      parsed.carryingPositions ?? product.carryingPositions;
    product.ean = parsed.ean ?? product.ean;
    product.character = parsed.character ?? product.character;
    product.description = parsed.description ?? product.description;
    product.searchKeywords = parsed.searchKeywords ?? product.searchKeywords;
    product.keyFeatures = parsed.keyFeatures ?? product.keyFeatures;
    product.externalId = parsed.externalId ?? product.externalId;
    product.netQuantity = parsed.netQuantity ?? product.netQuantity;

    product.width = parsed.width ?? product.width;
    product.height = parsed.height ?? product.height;
    product.depth = parsed.depth ?? product.depth;
    product.weight = parsed.weight ?? product.weight;
    product.assembledWidth = parsed.assembledWidth ?? product.assembledWidth;
    product.assembledHeight = parsed.assembledHeight ?? product.assembledHeight;
    product.assembledDepth = parsed.assembledDepth ?? product.assembledDepth;
    product.otherDimensions = parsed.otherDimensions ?? product.otherDimensions;

    product.wheelType = parsed.wheelType ?? product.wheelType;
    product.legSupport = parsed.legSupport ?? product.legSupport;
    product.headSupport = parsed.headSupport ?? product.headSupport;
    product.otherBodyFeatures =
      parsed.otherBodyFeatures ?? product.otherBodyFeatures;

    product.harnessType = parsed.harnessType ?? product.harnessType;

    product.boxWidth = parsed.boxWidth ?? product.boxWidth;
    product.boxLength = parsed.boxLength ?? product.boxLength;
    product.boxDepth = parsed.boxDepth ?? product.boxDepth;
    product.boxWeight = parsed.boxWeight ?? product.boxWeight;

    product.otherFeatures = parsed.otherFeatures ?? product.otherFeatures;

    product.domesticWarranty =
      parsed.domesticWarranty ?? product.domesticWarranty;
    product.internationalWarranty =
      parsed.internationalWarranty ?? product.internationalWarranty;
    product.warrantySummary = parsed.warrantySummary ?? product.warrantySummary;
    product.warrantyServiceType =
      parsed.warrantyServiceType ?? product.warrantyServiceType;
    product.coveredInWarranty =
      parsed.coveredInWarranty ?? product.coveredInWarranty;
    product.notCoveredInWarranty =
      parsed.notCoveredInWarranty ?? product.notCoveredInWarranty;

    // Update thumbnail if new provided
    if (thumbnail?.[0]) {
      product.thumbnail = {
        url: thumbnail[0].path,
        public_id: thumbnail[0].filename,
      };
    }

    // Update gallery if new provided
    if (gallery?.length) {
      product.gallery = gallery.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
    }

    // Update video if new provided
    if (video?.[0]) {
      product.video = {
        url: video[0].path,
        public_id: video[0].filename,
      };
    }

    // Save updated product
    await product.save();

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const deleted = await Product.findByIdAndDelete(productId);
    if (!deleted) {
      return res.status(404).json({ error: "Product not found for deletion" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};
// ✅ Total Product Count
exports.getProductCount = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.json({ totalProducts: count });
  } catch (err) {
    res.status(500).json({ error: "Failed to get product count" });
  }
};
// ✅ Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category")
      .populate("subcategory")
      .populate("brand");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};
// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category")
      .populate("subcategory")
      .populate("brand");

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product by ID" });
  }
};
