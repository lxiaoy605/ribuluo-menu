-- 订单表 v2 迁移
-- 在 Supabase SQL Editor 中手动执行

-- 1. 改 id 为 TEXT 类型（支持 RN+datetime 自定义格式）
--    先删默认值（SERIAL 的序列），再转换类型
ALTER TABLE orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE orders ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- 2. 新增订单状态（pending=预订 / completed=完成）
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE orders ADD CONSTRAINT check_status CHECK (status IN ('pending', 'completed'));

-- 3. 新增预订方式（dine_in=到店 / delivery=配送）
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_mode TEXT NOT NULL DEFAULT 'dine_in';
ALTER TABLE orders ADD CONSTRAINT check_order_mode CHECK (order_mode IN ('dine_in', 'delivery'));

-- 4. 新增配送地址（最长150字符）
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE orders ADD CONSTRAINT check_delivery_address CHECK (length(delivery_address) <= 150);

-- 5. 新增设备标识（用于顾客端历史查询）
ALTER TABLE orders ADD COLUMN IF NOT EXISTS device_id TEXT;

-- 6. 新增配送费（管理员可追加，顾客端仅展示）
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee INTEGER NOT NULL DEFAULT 0;
