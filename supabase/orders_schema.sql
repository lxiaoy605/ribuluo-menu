-- ============================================
-- 订单表 - 日不落串吧东北烧烤
-- 在 Supabase SQL Editor 中执行此脚本
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
  id            BIGSERIAL PRIMARY KEY,
  items         JSONB        NOT NULL DEFAULT '[]'::jsonb,
  guest_count   INTEGER      NOT NULL,
  total_amount  NUMERIC(10,0) NOT NULL,
  customer_name TEXT,
  contact_type  TEXT         NOT NULL CHECK (contact_type IN ('telegram', 'wechat', 'whatsapp', 'phone', 'other')),
  contact_info  TEXT         NOT NULL,
  notes         TEXT         CHECK (length(notes) <= 150),
  expected_time TEXT         NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 修改时间自动更新触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS：允许匿名用户插入和读取
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS allow_anon_insert ON orders;
CREATE POLICY allow_anon_insert ON orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS allow_anon_select ON orders;
CREATE POLICY allow_anon_select ON orders
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS allow_anon_update ON orders;
CREATE POLICY allow_anon_update ON orders
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS allow_anon_delete ON orders;
CREATE POLICY allow_anon_delete ON orders
  FOR DELETE
  TO anon
  USING (true);
