-- Update withdrawals table to match the new schema
ALTER TABLE withdrawals 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'RWF',
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS momo_reference_id UUID,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS momo_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS payer_message TEXT,
ADD COLUMN IF NOT EXISTS payee_note TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Update existing withdrawals to have default values for new required fields
UPDATE withdrawals 
SET 
  currency = 'RWF',
  external_id = user_id::text,
  momo_reference_id = gen_random_uuid(),
  phone_number = '250788000000',
  updated_at = now()
WHERE currency IS NULL OR external_id IS NULL OR momo_reference_id IS NULL OR phone_number IS NULL;

-- Make required fields NOT NULL after setting defaults
ALTER TABLE withdrawals 
ALTER COLUMN external_id SET NOT NULL,
ALTER COLUMN momo_reference_id SET NOT NULL,
ALTER COLUMN phone_number SET NOT NULL;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_withdrawals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_withdrawals_updated_at
  BEFORE UPDATE ON withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION update_withdrawals_updated_at();