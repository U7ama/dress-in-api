const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const AppError = require("../utils/appError");

exports.getUserOrder = asyncHandler(async (req, res) => {
  const id = req.query.userId;
  const userOrder = await Order.find({ userId: id });
  return res.status(200).json({
    status: "success",
    count: userOrder.length,
    data: userOrder,
  });
});

exports.createOrder = asyncHandler(async (req, res, next) => {
  const { url, id, email, orderItems, totalPrice } = req.body;

  const lineItems = await Promise.all(
    orderItems.map(async (product) => {
      const stripeProduct = await stripe.products.create({
        name: product.name, // Replace with the actual product name
      });

      const unitAmount = Math.round(Number(product.price) * 100); // Convert price to cents

      const price = await stripe.prices.create({
        unit_amount: unitAmount,
        currency: "usd",
        product: stripeProduct.id,
      });

      return {
        // name: product.name,
        price: price.id,
        quantity: product.quantity,
        // images: product.image,
        // currency: "php",
      };
    })
  );

  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    line_items: lineItems,
    mode: "payment",
    success_url: url,
    cancel_url: url,
  });

  const prodQty = async () => {
    return Promise.all(
      orderItems.map(async (items) => {
        const prod = await Product.findById({ _id: items._id });
        if (!prod) return next(new AppError("No Product Found!", 404));
        if (prod.quantity <= 0) return next(new AppError("Out of Stock!", 404));

        const quantity = prod.quantity - items.quantity;
        const doc = await Product.findByIdAndUpdate(
          { _id: items._id },
          { quantity }
        );

        return doc.quantity;
      })
    );
  };

  const data = await prodQty();

  if (!data) return next(new AppError("Order Cancelled!", 404));

  const productImageUrls = await Promise.all(
    orderItems.map(async (product) => {
      const productData = await Product.findById(product._id);
      return productData.imageCover; // Retrieve the product image URL
    })
  );

  const newOrder = await Order.create({
    ...req.body,
    userId: id,
    orderItems: orderItems.map((item, index) => ({
      ...item,
      image: productImageUrls[index], // Include the product image URL
    })),
  });

  const orderDetailsWithImages = {
    ...newOrder._doc,
    orderItems: newOrder.orderItems.map((item, index) => ({
      ...item,
      image: productImageUrls[index], // Include the product image URL
    })),
  };

  console.log("orderDetailsWithImages", orderDetailsWithImages);
  res.status(201).json({
    status: "success",
    message: "New Order Created",
    session,
    orderDetails: orderDetailsWithImages,
  });
});
