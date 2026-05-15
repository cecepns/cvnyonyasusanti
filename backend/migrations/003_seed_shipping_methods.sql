-- Seed ekspedisi default (tanpa logo; upload via admin)
USE arin_parabola_store;

INSERT INTO shipping_methods (name, is_active, sort_order)
SELECT * FROM (
  SELECT 'JNT' AS name, 1 AS is_active, 1 AS sort_order
  UNION ALL SELECT 'ID Express', 1, 2
  UNION ALL SELECT 'Baraka', 1, 3
  UNION ALL SELECT 'SiCepat', 1, 4
  UNION ALL SELECT 'SPX', 1, 5
  UNION ALL SELECT 'Anteraja', 1, 6
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM shipping_methods LIMIT 1);
