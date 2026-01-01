-- =========================================
-- PersonalMoneyManagement Database Setup
-- =========================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS moneyflow 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE moneyflow;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    currency_code VARCHAR(3) DEFAULT 'CAD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Custom Categories Table
CREATE TABLE IF NOT EXISTS custom_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    category_type ENUM('INCOME', 'EXPENSE') NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(7),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_category (user_id, category_name, category_type),
    INDEX idx_user_type (user_id, category_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    transaction_type ENUM('INCOME', 'EXPENSE') NOT NULL,
    category_id BIGINT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    description VARCHAR(500),
    notes TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'),
    tags VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES custom_categories(id),
    INDEX idx_user_date (user_id, transaction_date DESC),
    INDEX idx_user_type (user_id, transaction_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Investments Table
CREATE TABLE IF NOT EXISTS investments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    investment_type ENUM('STOCK', 'ETF', 'CRYPTO', 'BOND', 'OTHER') DEFAULT 'STOCK',
    stock_symbol VARCHAR(10) NOT NULL,
    stock_name VARCHAR(255),
    total_shares DECIMAL(15, 4) DEFAULT 0,
    average_cost DECIMAL(15, 4) DEFAULT 0,
    total_invested DECIMAL(15, 2) DEFAULT 0,
    current_price DECIMAL(15, 4),
    current_value DECIMAL(15, 2),
    profit_loss DECIMAL(15, 2),
    profit_loss_percent DECIMAL(8, 2),
    last_updated TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_stock (user_id, stock_symbol),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Investment Transactions Table
CREATE TABLE IF NOT EXISTS investment_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    investment_id BIGINT NOT NULL,
    transaction_type ENUM('BUY', 'SELL') NOT NULL,
    shares DECIMAL(15, 4) NOT NULL,
    price_per_share DECIMAL(15, 4) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    fees DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE,
    INDEX idx_investment_date (investment_id, transaction_date DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assets Table
CREATE TABLE IF NOT EXISTS assets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    asset_type ENUM('CASH', 'REAL_ESTATE', 'VEHICLE', 'OTHER') NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    current_value DECIMAL(15, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Loans Table
CREATE TABLE IF NOT EXISTS loans (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    loan_type ENUM('MORTGAGE', 'CAR_LOAN', 'STUDENT_LOAN', 'PERSONAL_LOAN', 'OTHER') NOT NULL,
    loan_name VARCHAR(255) NOT NULL,
    principal_amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    term_months INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_payment DECIMAL(10, 2) NOT NULL,
    remaining_balance DECIMAL(15, 2) NOT NULL,
    payments_made INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Loan Payments Table
CREATE TABLE IF NOT EXISTS loan_payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    loan_id BIGINT NOT NULL,
    payment_date DATE NOT NULL,
    payment_amount DECIMAL(10, 2) NOT NULL,
    principal_paid DECIMAL(10, 2) NOT NULL,
    interest_paid DECIMAL(10, 2) NOT NULL,
    remaining_balance DECIMAL(15, 2) NOT NULL,
    is_extra_payment BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
    INDEX idx_loan_date (loan_id, payment_date DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- Insert sample data (optional)
-- =========================================

-- Create a test user (password: password123)
INSERT INTO users (email, password_hash, first_name, last_name) VALUES
('test@example.com', '$2a$10$rX8qKq8KQZ8yJxz8YqR8YOqH8qH8qH8qH8qH8qH8qH8qH8qH8qH8q', 'Test', 'User');

-- Get the user ID
SET @user_id = LAST_INSERT_ID();

-- Insert default income categories
INSERT INTO custom_categories (user_id, category_type, category_name, is_default) VALUES
(@user_id, 'INCOME', 'Salary', TRUE),
(@user_id, 'INCOME', 'Side Hustle', TRUE),
(@user_id, 'INCOME', 'Rebate', TRUE),
(@user_id, 'INCOME', 'Interest Income', TRUE),
(@user_id, 'INCOME', 'Refund', TRUE),
(@user_id, 'INCOME', 'Government Benefits', TRUE),
(@user_id, 'INCOME', 'Other Income', TRUE);

-- Insert default expense categories
INSERT INTO custom_categories (user_id, category_type, category_name, is_default) VALUES
(@user_id, 'EXPENSE', 'Housing', TRUE),
(@user_id, 'EXPENSE', 'Utilities', TRUE),
(@user_id, 'EXPENSE', 'Groceries', TRUE),
(@user_id, 'EXPENSE', 'Dining Out', TRUE),
(@user_id, 'EXPENSE', 'Transportation', TRUE),
(@user_id, 'EXPENSE', 'Healthcare', TRUE),
(@user_id, 'EXPENSE', 'Entertainment', TRUE),
(@user_id, 'EXPENSE', 'Shopping', TRUE),
(@user_id, 'EXPENSE', 'Insurance', TRUE),
(@user_id, 'EXPENSE', 'Education', TRUE),
(@user_id, 'EXPENSE', 'Other Expense', TRUE);

