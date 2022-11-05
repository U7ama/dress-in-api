const { Schema, model } = require("mongoose");
const slugify = require("slugify");

const productSchema = new Schema(
  {
    quantity: {
      type: "Number",
    },
    averageRating: {
      type: "Number",
    },
    ratingsQuantity: {
      type: "Number",
    },
    images: {
      type: "Array",
    },
    _id: {
      type: "ObjectId",
    },
    name: {
      type: "String",
    },
    description: {
      type: "String",
    },
    category: {
      name: {
        type: "String",
      },
    },
    imageCover: {
      type: "String",
    },
    price: {
      type: "Number",
    },
    slug: {
      type: "String",
    },
    __v: {
      type: "Number",
    },
    id: {
      type: "ObjectId",
    },
  },
  {
    toJSON: { virtuals: true },
  }
);

productSchema.pre("remove", async function (next) {
  await this.model("Review").deleteMany({ productId: this._id });

  next();
});

productSchema.virtual("Reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "productId",
  justOne: false,
});

productSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

productSchema.pre(/^find/, function (next) {
  this.populate({
    path: "category",
    select: "-__v -_id",
  });
  next();
});

const Product = model("Product", productSchema);

module.exports = Product;
