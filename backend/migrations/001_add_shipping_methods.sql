-- Migration: jasa kirim / ekspedisi
USE arin_parabola_store;

CREATE TABLE IF NOT EXISTS shipping_methods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  image VARCHAR(255),
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
