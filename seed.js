import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";  // adjust path if needed

dotenv.config();

const products = [
  {
    name: "Classic Mink Lashes",
    price: 7000,
    category: "Lashes",
    description: "Soft lightweight classic mink lashes.",
    images: [],
    stock: 20
  },
  {
    name: "Hybrid Lashes",
    price: 9500,
    category: "Lashes",
    description: "Beautiful hybrid lash extensions.",
    images: [],
    stock: 15
  }
];

const seedProducts = async () => {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Deleting existing products...");
    await Product.deleteMany();

    console.log("Inserting new products...");
    await Product.insertMany(products);

    console.log("Seeding completed!");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedProducts();
