-- V2__add_account_type_to_investments.sql
-- 为 investments 表添加 account_type 字段

ALTER TABLE investments 
ADD COLUMN account_type VARCHAR(50) DEFAULT 'NON_REGISTERED' AFTER investment_type;

-- 为现有数据设置默认值
UPDATE investments 
SET account_type = 'NON_REGISTERED' 
WHERE account_type IS NULL;

-- 添加注释
ALTER TABLE investments 
MODIFY COLUMN account_type VARCHAR(50) NOT NULL DEFAULT 'NON_REGISTERED' 
COMMENT 'Account type: TFSA, RRSP, RESP, FHSA, NON_REGISTERED, OTHER';
