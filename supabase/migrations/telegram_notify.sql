-- Telegram 订单通知迁移
-- 在 orders 表添加 telegram_message_id 用于编辑已发送的消息

ALTER TABLE orders ADD COLUMN IF NOT EXISTS telegram_message_id BIGINT;
