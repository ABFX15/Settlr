-- Subscriptions feature
-- Adds subscription_plans, subscriptions, and subscription_payments tables

-- Subscription Plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id VARCHAR(32) PRIMARY KEY, -- plan_xxxx format
    merchant_id VARCHAR(44) NOT NULL, -- wallet address
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(18, 6) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USDC',
    interval VARCHAR(10) NOT NULL CHECK (interval IN ('daily', 'weekly', 'monthly', 'yearly')),
    interval_count INTEGER DEFAULT 1,
    trial_days INTEGER DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    active BOOLEAN DEFAULT true,
    subscriber_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(32) PRIMARY KEY, -- sub_xxxx format
    plan_id VARCHAR(32) NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    merchant_id VARCHAR(44) NOT NULL, -- wallet address (same as merchant_wallet)
    merchant_wallet VARCHAR(44) NOT NULL,
    customer_wallet VARCHAR(44) NOT NULL,
    customer_email VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('trialing', 'active', 'past_due', 'paused', 'cancelled', 'expired')),
    amount DECIMAL(18, 6) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USDC',
    interval VARCHAR(10) NOT NULL,
    interval_count INTEGER DEFAULT 1,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    trial_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    paused_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- A customer can only have one active subscription per plan
    CONSTRAINT unique_active_sub UNIQUE (plan_id, customer_wallet)
);

-- Subscription Payments (billing history)
CREATE TABLE IF NOT EXISTS subscription_payments (
    id VARCHAR(32) PRIMARY KEY, -- sp_xxxx format
    subscription_id VARCHAR(32) NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    plan_id VARCHAR(32) NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    merchant_wallet VARCHAR(44) NOT NULL,
    customer_wallet VARCHAR(44) NOT NULL,
    amount DECIMAL(18, 6) NOT NULL,
    platform_fee DECIMAL(18, 6) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USDC',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    tx_signature VARCHAR(88),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    attempt_count INTEGER DEFAULT 1,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_merchant ON subscription_plans(merchant_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(active);

CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_merchant ON subscriptions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions(customer_wallet);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_subscriptions_due ON subscriptions(status, current_period_end)
    WHERE status IN ('active', 'past_due');

CREATE INDEX IF NOT EXISTS idx_subscription_payments_sub ON subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_status ON subscription_payments(status);

-- Triggers
CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for service role" ON subscription_plans FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON subscriptions FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON subscription_payments FOR ALL USING (true);
