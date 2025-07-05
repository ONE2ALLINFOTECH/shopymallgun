const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: false, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory", required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },

  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  finalPrice: { type: Number },
  listingStatus: { type: String, required: true },
  mrp: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  minOrderQty: { type: Number },
  fulfilmentBy: { type: String, required: true },
  procurementType: { type: String },
  procurementSLA: { type: Number, required: true },
  stock: { type: Number, required: true },
  shippingProvider: { type: String },
 local: { type: Number },
  zonal: { type: Number },
  national: { type: Number },

  
    lengthCM: { type: Number, required: true },
    breadthCM: { type: Number, required: true },
    heightCM: { type: Number, required: true },
    weightKG: { type: Number, required: true },
 
  hsn: { type: String, required: true },
  luxuryCess: { type: Number },
  taxCode: { type: String, required: true },
  countryOfOrigin: { type: String, required: true },
  manufacturerDetails: { type: String, required: true },
  packerDetails: { type: String, required: true },
  importerDetails: { type: String },

  description: { type: String },
  highlights: [String],
  specifications: {
    type: Map,
    of: String,
  },
  offers: [String],

  thumbnail: {
    url: String,
    public_id: String,
  },
 
video: {
  url: String,
  public_id: String,
},

  gallery: [
    {
      url: String,
      public_id: String,
    },
  ],
    modelName: String,
  modelNumber: String,
  type: String,
  brandColors: [String],
  maxAge: Number,
  minAge: Number,
  salesPackages: [String],
  weightCapacity: {
    value: Number,
    unit: String,
  },
  material: String,
  colors: {
  type: [String],
  default: [],
},
carryingPositions: {
  type: [String],
  default: [],
},
ean: String,
  character: String,
  description: String,
  searchKeywords: String,
  keyFeatures: String,
  externalId: String,
  netQuantity: String,

  width: String,
  height: String,
  depth: String,
  weight: String,
  assembledWidth: String,
  assembledHeight: String,
  assembledDepth: String,
  otherDimensions: String,

  wheelType: String,
  legSupport: String,
  headSupport: String,
  otherBodyFeatures: String,

  harnessType: String,

  boxWidth: String,
  boxLength: String,
  boxDepth: String,
  boxWeight: String,

  otherFeatures: String,

  domesticWarranty: String,
  internationalWarranty: String,
  warrantySummary: String,
  warrantyServiceType: String,
  coveredInWarranty: String,
  notCoveredInWarranty: String,
}, { timestamps: true });

// Calculate final price before save
productSchema.pre("save", function (next) {
  this.finalPrice = this.price - (this.price * this.discount / 100);
  next();
});

module.exports = mongoose.model("Product", productSchema);
