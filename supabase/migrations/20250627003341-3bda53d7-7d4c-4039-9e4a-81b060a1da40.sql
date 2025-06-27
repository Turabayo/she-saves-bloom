
-- Update transactions table to support MoMo transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS reference_id TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'RWF',
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'momo';

-- Add index for better performance on reference_id lookups
CREATE INDEX IF NOT EXISTS idx_transactions_reference_id ON public.transactions(reference_id);

-- Add index for status lookups
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
