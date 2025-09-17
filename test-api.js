// Test script to verify the products API
import { productApi } from "./src/lib/api/products.js";

async function testProductsAPI() {
  try {
    console.log("Testing products API...");

    const products = await productApi.findAll();
    console.log("✅ Products API successful");
    console.log(`📊 Found ${products.length} products`);

    if (products.length > 0) {
      console.log("📝 Sample product:", {
        id: products[0].id,
        title: products[0].title,
        sku: products[0].sku,
        basePrice: products[0].basePrice,
      });
    }
  } catch (error) {
    console.error("❌ Products API failed:", error.message);
  }
}

testProductsAPI();
