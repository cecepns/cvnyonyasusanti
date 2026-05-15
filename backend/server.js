require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "arin-parabola-secret";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const uploadsDir = path.join(__dirname, "uploads-arin-parabola");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({ storage });
const productUpload = upload.fields([
  { name: "images", maxCount: 10 },
  { name: "variant_images", maxCount: 30 },
]);
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "arin_parabola_store",
  waitForConnections: true,
  connectionLimit: 10,
});

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads-arin-parabola", express.static(uploadsDir));

function fileUrl(req, fileName) {
  if (!fileName) return null;
  return `${req.protocol}://${req.get("host")}/uploads-arin-parabola/${fileName}`;
}

function unlinkIfExists(fileName) {
  if (!fileName) return;
  const target = path.join(uploadsDir, fileName);
  if (fs.existsSync(target)) fs.unlinkSync(target);
}

function auth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

async function query(sql, values = []) {
  const [rows] = await db.query(sql, values);
  return rows;
}

function parseJsonArray(value, fallback = []) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (_err) {
    return fallback;
  }
}

async function getProductVariants(req, productId) {
  const rows = await query("SELECT * FROM product_variants WHERE product_id=? ORDER BY id ASC", [productId]);
  return rows.map((item) => ({ ...item, image_url: fileUrl(req, item.image) }));
}

async function syncProductVariants(req, productId, body, files = []) {
  const variants = parseJsonArray(body.variants);
  const keepVariantIds = parseJsonArray(body.keepVariantIds).map(Number);
  const variantFiles = files || [];
  let fileIdx = 0;

  const currentVariants = await query("SELECT * FROM product_variants WHERE product_id=?", [productId]);
  for (const variant of currentVariants) {
    if (!keepVariantIds.includes(variant.id)) {
      await query("DELETE FROM product_variants WHERE id=?", [variant.id]);
      unlinkIfExists(variant.image);
    }
  }

  for (const variant of variants) {
    if (!variant?.name) continue;

    let nextImage = null;
    if (variant.hasNewImage && variantFiles[fileIdx]) {
      nextImage = variantFiles[fileIdx].filename;
      fileIdx += 1;
    }

    if (variant.id) {
      const [existing] = await query("SELECT * FROM product_variants WHERE id=? AND product_id=?", [
        variant.id,
        productId,
      ]);
      if (!existing) continue;
      const imageToSave = nextImage || existing.image;
      await query("UPDATE product_variants SET name=?, price=?, image=? WHERE id=?", [
        variant.name,
        Number(variant.price || 0),
        imageToSave,
        variant.id,
      ]);
      if (nextImage && existing.image && existing.image !== nextImage) unlinkIfExists(existing.image);
    } else {
      await query("INSERT INTO product_variants (product_id, name, price, image) VALUES (?, ?, ?, ?)", [
        productId,
        variant.name,
        Number(variant.price || 0),
        nextImage,
      ]);
    }
  }
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Username/password salah" });
  }
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "12h" });
  return res.json({ token, username });
});

app.get("/api/admin/dashboard", auth, async (_req, res) => {
  try {
    const [products] = await query("SELECT COUNT(*) AS total FROM products");
    const [categories] = await query("SELECT COUNT(*) AS total FROM categories");
    const [banners] = await query("SELECT COUNT(*) AS total FROM banners");
    const [payments] = await query("SELECT COUNT(*) AS total FROM payment_methods");
    const [shipping] = await query("SELECT COUNT(*) AS total FROM shipping_methods");
    res.json({ products, categories, banners, payments, shipping });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/settings/public", async (_req, res) => {
  try {
    const [settings] = await query("SELECT * FROM website_settings ORDER BY id DESC LIMIT 1");
    const methods = await query("SELECT * FROM payment_methods ORDER BY id DESC");
    const shipping = await query(
      "SELECT * FROM shipping_methods WHERE is_active=1 ORDER BY sort_order ASC, id ASC"
    );
    res.json({
      settings: settings || null,
      paymentMethods: methods || [],
      shippingMethods: shipping.map((item) => ({ ...item, image_url: fileUrl(_req, item.image) })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/admin/settings", auth, async (_req, res) => {
  try {
    const [settings] = await query("SELECT * FROM website_settings ORDER BY id DESC LIMIT 1");
    res.json(settings || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/admin/settings", auth, async (req, res) => {
  try {
    const { site_name, email, whatsapp, contact_address, footer_info, footer_links } = req.body;
    const [existing] = await query("SELECT * FROM website_settings ORDER BY id DESC LIMIT 1");
    if (!existing) {
      await query(
        "INSERT INTO website_settings (site_name, email, whatsapp, contact_address, footer_info, footer_links) VALUES (?, ?, ?, ?, ?, ?)",
        [site_name, email, whatsapp, contact_address, footer_info, footer_links]
      );
    } else {
      await query(
        "UPDATE website_settings SET site_name=?, email=?, whatsapp=?, contact_address=?, footer_info=?, footer_links=? WHERE id=?",
        [site_name, email, whatsapp, contact_address, footer_info, footer_links, existing.id]
      );
    }
    const [updated] = await query("SELECT * FROM website_settings ORDER BY id DESC LIMIT 1");
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/banners", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM banners ORDER BY sort_order ASC, id DESC");
    res.json(rows.map((item) => ({ ...item, image_url: fileUrl(req, item.image) })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/admin/banners", auth, async (req, res) => {
  try {
    const rows = await query("SELECT * FROM banners ORDER BY sort_order ASC, id DESC");
    res.json(rows.map((item) => ({ ...item, image_url: fileUrl(req, item.image) })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/admin/banners", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, sort_order } = req.body;
    await query("INSERT INTO banners (title, image, sort_order) VALUES (?, ?, ?)", [
      title || "",
      req.file?.filename || null,
      Number(sort_order || 0),
    ]);
    res.json({ message: "Banner ditambahkan" });
  } catch (error) {
    if (req.file?.filename) unlinkIfExists(req.file.filename);
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/admin/banners/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const [old] = await query("SELECT * FROM banners WHERE id=?", [id]);
    if (!old) return res.status(404).json({ message: "Banner tidak ditemukan" });
    const nextImage = req.file?.filename || old.image;
    await query("UPDATE banners SET title=?, image=?, sort_order=? WHERE id=?", [
      req.body.title || "",
      nextImage,
      Number(req.body.sort_order || 0),
      id,
    ]);
    if (req.file?.filename && old.image && old.image !== req.file.filename) unlinkIfExists(old.image);
    res.json({ message: "Banner diperbarui" });
  } catch (error) {
    if (req.file?.filename) unlinkIfExists(req.file.filename);
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/admin/banners/:id", auth, async (req, res) => {
  try {
    const [old] = await query("SELECT * FROM banners WHERE id=?", [req.params.id]);
    if (!old) return res.status(404).json({ message: "Banner tidak ditemukan" });
    await query("DELETE FROM banners WHERE id=?", [req.params.id]);
    unlinkIfExists(old.image);
    res.json({ message: "Banner dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM categories ORDER BY id DESC");
    res.json(rows.map((item) => ({ ...item, image_url: fileUrl(req, item.image) })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/admin/categories", auth, async (req, res) => {
  try {
    const rows = await query("SELECT * FROM categories ORDER BY id DESC");
    res.json(rows.map((item) => ({ ...item, image_url: fileUrl(req, item.image) })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/admin/categories", auth, upload.single("image"), async (req, res) => {
  try {
    await query("INSERT INTO categories (name, image) VALUES (?, ?)", [
      req.body.name || "",
      req.file?.filename || null,
    ]);
    res.json({ message: "Kategori ditambahkan" });
  } catch (error) {
    if (req.file?.filename) unlinkIfExists(req.file.filename);
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/admin/categories/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const [old] = await query("SELECT * FROM categories WHERE id=?", [req.params.id]);
    if (!old) return res.status(404).json({ message: "Kategori tidak ditemukan" });
    const nextImage = req.file?.filename || old.image;
    await query("UPDATE categories SET name=?, image=? WHERE id=?", [req.body.name || "", nextImage, req.params.id]);
    if (req.file?.filename && old.image && old.image !== req.file.filename) unlinkIfExists(old.image);
    res.json({ message: "Kategori diperbarui" });
  } catch (error) {
    if (req.file?.filename) unlinkIfExists(req.file.filename);
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/admin/categories/:id", auth, async (req, res) => {
  try {
    const [old] = await query("SELECT * FROM categories WHERE id=?", [req.params.id]);
    if (!old) return res.status(404).json({ message: "Kategori tidak ditemukan" });
    await query("DELETE FROM categories WHERE id=?", [req.params.id]);
    unlinkIfExists(old.image);
    res.json({ message: "Kategori dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const limit = Number(req.query.limit || 50);
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : null;
    const search = req.query.search ? `%${req.query.search}%` : null;

    let sql = `
      SELECT p.*, c.name AS category_name,
      (SELECT image FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.id ASC LIMIT 1) AS primary_image
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE 1=1
    `;
    const params = [];
    if (categoryId) {
      sql += " AND p.category_id=? ";
      params.push(categoryId);
    }
    if (search) {
      sql += " AND p.name LIKE ? ";
      params.push(search);
    }
    sql += " ORDER BY p.id DESC LIMIT ?";
    params.push(limit);

    const rows = await query(sql, params);
    res.json(rows.map((item) => ({ ...item, primary_image_url: fileUrl(req, item.primary_image) })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const [product] = await query(
      "SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.id=?",
      [req.params.id]
    );
    if (!product) return res.status(404).json({ message: "Produk tidak ditemukan" });
    const images = await query("SELECT * FROM product_images WHERE product_id=? ORDER BY id ASC", [req.params.id]);
    const variants = await getProductVariants(req, req.params.id);
    res.json({
      ...product,
      images: images.map((img) => ({ ...img, image_url: fileUrl(req, img.image) })),
      variants,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/admin/products", auth, async (req, res) => {
  try {
    const rows = await query(
      "SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id=p.category_id ORDER BY p.id DESC"
    );
    const data = await Promise.all(
      rows.map(async (item) => {
        const images = await query("SELECT * FROM product_images WHERE product_id=? ORDER BY id ASC", [item.id]);
        const variants = await getProductVariants(req, item.id);
        return {
          ...item,
          images: images.map((img) => ({ ...img, image_url: fileUrl(req, img.image) })),
          variants,
        };
      })
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/admin/products", auth, productUpload, async (req, res) => {
  const uploadedImages = req.files?.images || [];
  const uploadedVariantImages = req.files?.variant_images || [];
  try {
    const { name, price, category_id, short_description, description } = req.body;
    const result = await query(
      "INSERT INTO products (name, price, category_id, short_description, description) VALUES (?, ?, ?, ?, ?)",
      [name, Number(price || 0), Number(category_id || 0), short_description || "", description || ""]
    );
    const productId = result.insertId;
    for (const file of uploadedImages) {
      await query("INSERT INTO product_images (product_id, image) VALUES (?, ?)", [productId, file.filename]);
    }
    await syncProductVariants(req, productId, req.body, uploadedVariantImages);
    res.json({ message: "Produk ditambahkan" });
  } catch (error) {
    uploadedImages.forEach((file) => unlinkIfExists(file.filename));
    uploadedVariantImages.forEach((file) => unlinkIfExists(file.filename));
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/admin/products/:id", auth, productUpload, async (req, res) => {
  const uploadedImages = req.files?.images || [];
  const uploadedVariantImages = req.files?.variant_images || [];
  try {
    const { id } = req.params;
    const [old] = await query("SELECT * FROM products WHERE id=?", [id]);
    if (!old) return res.status(404).json({ message: "Produk tidak ditemukan" });

    const keepImageIds = parseJsonArray(req.body.keepImageIds).map(Number);

    await query(
      "UPDATE products SET name=?, price=?, category_id=?, short_description=?, description=? WHERE id=?",
      [
        req.body.name,
        Number(req.body.price || 0),
        Number(req.body.category_id || 0),
        req.body.short_description || "",
        req.body.description || "",
        id,
      ]
    );

    const currentImages = await query("SELECT * FROM product_images WHERE product_id=?", [id]);
    const toDelete = currentImages.filter((img) => !keepImageIds.includes(img.id));
    for (const img of toDelete) {
      await query("DELETE FROM product_images WHERE id=?", [img.id]);
      unlinkIfExists(img.image);
    }

    for (const file of uploadedImages) {
      await query("INSERT INTO product_images (product_id, image) VALUES (?, ?)", [id, file.filename]);
    }

    await syncProductVariants(req, id, req.body, uploadedVariantImages);

    res.json({ message: "Produk diperbarui" });
  } catch (error) {
    uploadedImages.forEach((file) => unlinkIfExists(file.filename));
    uploadedVariantImages.forEach((file) => unlinkIfExists(file.filename));
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/admin/products/:id", auth, async (req, res) => {
  try {
    const [product] = await query("SELECT * FROM products WHERE id=?", [req.params.id]);
    if (!product) return res.status(404).json({ message: "Produk tidak ditemukan" });
    const images = await query("SELECT * FROM product_images WHERE product_id=?", [req.params.id]);
    for (const img of images) unlinkIfExists(img.image);
    await query("DELETE FROM product_images WHERE product_id=?", [req.params.id]);
    const variants = await query("SELECT * FROM product_variants WHERE product_id=?", [req.params.id]);
    for (const variant of variants) unlinkIfExists(variant.image);
    await query("DELETE FROM product_variants WHERE product_id=?", [req.params.id]);
    await query("DELETE FROM products WHERE id=?", [req.params.id]);
    res.json({ message: "Produk dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/payment-methods", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM payment_methods WHERE is_active=1 ORDER BY id DESC");
    res.json(rows.map((item) => ({ ...item, image_url: fileUrl(req, item.image) })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/admin/payment-methods", auth, async (req, res) => {
  try {
    const rows = await query("SELECT * FROM payment_methods ORDER BY id DESC");
    res.json(rows.map((item) => ({ ...item, image_url: fileUrl(req, item.image) })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/admin/payment-methods", auth, upload.single("image"), async (req, res) => {
  try {
    const { name, account_name, account_number, is_active } = req.body;
    await query(
      "INSERT INTO payment_methods (name, account_name, account_number, is_active, image) VALUES (?, ?, ?, ?, ?)",
      [name, account_name || "", account_number || "", Number(is_active ?? 1), req.file?.filename || null]
    );
    res.json({ message: "Metode pembayaran ditambahkan" });
  } catch (error) {
    if (req.file?.filename) unlinkIfExists(req.file.filename);
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/admin/payment-methods/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const [old] = await query("SELECT * FROM payment_methods WHERE id=?", [req.params.id]);
    if (!old) return res.status(404).json({ message: "Metode tidak ditemukan" });
    const nextImage = req.file?.filename || old.image;
    await query(
      "UPDATE payment_methods SET name=?, account_name=?, account_number=?, is_active=?, image=? WHERE id=?",
      [
        req.body.name,
        req.body.account_name || "",
        req.body.account_number || "",
        Number(req.body.is_active ?? 1),
        nextImage,
        req.params.id,
      ]
    );
    if (req.file?.filename && old.image && old.image !== req.file.filename) unlinkIfExists(old.image);
    res.json({ message: "Metode pembayaran diperbarui" });
  } catch (error) {
    if (req.file?.filename) unlinkIfExists(req.file.filename);
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/admin/payment-methods/:id", auth, async (req, res) => {
  try {
    const [old] = await query("SELECT * FROM payment_methods WHERE id=?", [req.params.id]);
    if (!old) return res.status(404).json({ message: "Metode tidak ditemukan" });
    await query("DELETE FROM payment_methods WHERE id=?", [req.params.id]);
    unlinkIfExists(old.image);
    res.json({ message: "Metode pembayaran dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/shipping-methods", async (req, res) => {
  try {
    const rows = await query(
      "SELECT * FROM shipping_methods WHERE is_active=1 ORDER BY sort_order ASC, id ASC"
    );
    res.json(rows.map((item) => ({ ...item, image_url: fileUrl(req, item.image) })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/admin/shipping-methods", auth, async (req, res) => {
  try {
    const rows = await query("SELECT * FROM shipping_methods ORDER BY sort_order ASC, id ASC");
    res.json(rows.map((item) => ({ ...item, image_url: fileUrl(req, item.image) })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/admin/shipping-methods", auth, upload.single("image"), async (req, res) => {
  try {
    const { name, is_active, sort_order } = req.body;
    await query("INSERT INTO shipping_methods (name, is_active, sort_order, image) VALUES (?, ?, ?, ?)", [
      name,
      Number(is_active ?? 1),
      Number(sort_order || 0),
      req.file?.filename || null,
    ]);
    res.json({ message: "Jasa kirim ditambahkan" });
  } catch (error) {
    if (req.file?.filename) unlinkIfExists(req.file.filename);
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/admin/shipping-methods/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const [old] = await query("SELECT * FROM shipping_methods WHERE id=?", [req.params.id]);
    if (!old) return res.status(404).json({ message: "Jasa kirim tidak ditemukan" });
    const nextImage = req.file?.filename || old.image;
    await query("UPDATE shipping_methods SET name=?, is_active=?, sort_order=?, image=? WHERE id=?", [
      req.body.name,
      Number(req.body.is_active ?? 1),
      Number(req.body.sort_order || 0),
      nextImage,
      req.params.id,
    ]);
    if (req.file?.filename && old.image && old.image !== req.file.filename) unlinkIfExists(old.image);
    res.json({ message: "Jasa kirim diperbarui" });
  } catch (error) {
    if (req.file?.filename) unlinkIfExists(req.file.filename);
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/admin/shipping-methods/:id", auth, async (req, res) => {
  try {
    const [old] = await query("SELECT * FROM shipping_methods WHERE id=?", [req.params.id]);
    if (!old) return res.status(404).json({ message: "Jasa kirim tidak ditemukan" });
    await query("DELETE FROM shipping_methods WHERE id=?", [req.params.id]);
    unlinkIfExists(old.image);
    res.json({ message: "Jasa kirim dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.use((error, _req, res, _next) => {
  res.status(500).json({ message: error.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
