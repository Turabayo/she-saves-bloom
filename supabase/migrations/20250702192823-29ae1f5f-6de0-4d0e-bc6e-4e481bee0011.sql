
-- Create a dedicated table for MoMo payment tracking
CREATE TABLE public.momo_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reference_id TEXT UNIQUE NOT NULL,
  external_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'RWF',
  phone TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESSFUL', 'FAILED', 'REJECTED', 'TIMEOUT')),
  financial_transaction_id TEXT,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  callback_received_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.momo_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage own momo transactions" ON public.momo_transactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all momo transactions" ON public.momo_transactions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Add indexes for better performance
CREATE INDEX idx_momo_transactions_reference_id ON public.momo_transactions(reference_id);
CREATE INDEX idx_momo_transactions_status ON public.momo_transactions(status);
CREATE INDEX idx_momo_transactions_user_id ON public.momo_transactions(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_momo_transactions_updated_at 
  BEFORE UPDATE ON public.momo_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
