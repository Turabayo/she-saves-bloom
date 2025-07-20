-- Create savings_goals table
CREATE TABLE public.savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  goal_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create savings table (for top-ups/deposits into goals)
CREATE TABLE public.savings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  source TEXT DEFAULT 'momo',
  type TEXT DEFAULT 'topup',
  status TEXT DEFAULT 'success',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create withdrawals table
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES savings_goals(id),
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update transactions table for analytics dashboard
DROP TABLE IF EXISTS public.transactions;
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- incoming, bank_transfer, cash_power, etc.
  amount NUMERIC NOT NULL,
  goal_id UUID REFERENCES savings_goals(id),
  method TEXT DEFAULT 'momo',
  status TEXT DEFAULT 'success',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for savings_goals
CREATE POLICY "Users can manage own savings goals" 
ON public.savings_goals 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all savings goals" 
ON public.savings_goals 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for savings
CREATE POLICY "Users can manage own savings" 
ON public.savings 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all savings" 
ON public.savings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for withdrawals
CREATE POLICY "Users can manage own withdrawals" 
ON public.withdrawals 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawals" 
ON public.withdrawals 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for transactions
CREATE POLICY "Users can manage own transactions" 
ON public.transactions 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" 
ON public.transactions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_savings_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_savings_goals_updated_at
  BEFORE UPDATE ON public.savings_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_savings_goals_updated_at();