import mongoose from "mongoose";
import dotenv from "dotenv";
import slugify from "slugify";
import Product from "./models/Product.js";
import Category from "./models/Category.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log("🔌 Connecting to DB...");
    await mongoose.connect(process.env.MONGO_URI);

    /* =====================
       CLEAR EXISTING DATA
    ====================== */
    console.log("🗑️ Clearing collections...");
    await Product.deleteMany();
    await Category.deleteMany();

    /* =====================
       SEED CATEGORIES
    ====================== */
    console.log("🌱 Seeding categories...");

    const categoryData = [
      {
        name: "Lashes",
        slug: slugify("Lashes", { lower: true, strict: true }),
        description: "Premium lash products",
        icon: "fa-eye",
        isActive: true,
        displayOrder: 1
      },
      {
        name: "Tattoos",
        slug: slugify("Tattoos", { lower: true, strict: true }),
        description: "Professional tattoo services",
        icon: "fa-pen-nib",
        isActive: true,
        displayOrder: 2
      },
      {
        name: "Brows",
        slug: slugify("Brows", { lower: true, strict: true }),
        description: "Brow styling and enhancement",
        icon: "fa-hand-sparkles",
        isActive: true,
        displayOrder: 3
      },
      {
        name: "Spa",
        slug: slugify("Spa", { lower: true, strict: true }),
        description: "Relaxation and spa services",
        icon: "fa-spa",
        isActive: true,
        displayOrder: 4
      }
    ];

    const createdCategories = await Category.insertMany(categoryData);

    // Build category lookup map
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    /* =====================
       SEED PRODUCTS
    ====================== */
    console.log("🛍️ Seeding products...");

    const productData = [
      {
        name: "Classic Mink Lashes",
        price: 7000,
        category: categoryMap["Lashes"],
        description: "Soft lightweight classic mink lashes.",
        images: [],
        stock: 20,
        isActive: true
      },
      {
        name: "Hybrid Lashes",
        price: 9500,
        category: categoryMap["Lashes"],
        description: "Beautiful hybrid lash extensions.",
        images: [],
        stock: 15,
        isActive: true
      }
    ];

    await Product.insertMany(productData);

    console.log("✅ Database seeding completed successfully!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
