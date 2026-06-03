-- ============================================
-- 菜单配置表 - 单行存储全部菜单数据
-- 在 Supabase SQL Editor 中执行此脚本
-- ============================================

CREATE TABLE IF NOT EXISTS menu_config (
  id         INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data       JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS：允许匿名读写（应用层通过密码验证管理员身份）
ALTER TABLE menu_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS allow_read ON menu_config;
CREATE POLICY allow_read ON menu_config
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS allow_insert ON menu_config;
CREATE POLICY allow_insert ON menu_config
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS allow_update ON menu_config;
CREATE POLICY allow_update ON menu_config
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
