-- Create budget_periods table for monthly budget tracking
CREATE TABLE public.budget_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'RWF',
  planned_income NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month, year)
);

-- Enable RLS
ALTER TABLE public.budget_periods ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budget_periods
CREATE POLICY "Users can view their own budget periods" 
ON public.budget_periods FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget periods" 
ON public.budget_periods FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget periods" 
ON public.budget_periods FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget periods" 
ON public.budget_periods FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all budget periods" 
ON public.budget_periods FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create budget_bills table for fixed monthly costs
CREATE TABLE public.budget_bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  budget_period_id UUID NOT NULL REFERENCES public.budget_periods(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  planned_amount NUMERIC NOT NULL DEFAULT 0,
  actual_amount NUMERIC NOT NULL DEFAULT 0,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.budget_bills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budget_bills
CREATE POLICY "Users can view their own budget bills" 
ON public.budget_bills FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget bills" 
ON public.budget_bills FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget bills" 
ON public.budget_bills FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget bills" 
ON public.budget_bills FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all budget bills" 
ON public.budget_bills FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create budget_debts table for debt tracking
CREATE TABLE public.budget_debts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  budget_period_id UUID NOT NULL REFERENCES public.budget_periods(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  planned_amount NUMERIC NOT NULL DEFAULT 0,
  actual_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.budget_debts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budget_debts
CREATE POLICY "Users can view their own budget debts" 
ON public.budget_debts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget debts" 
ON public.budget_debts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget debts" 
ON public.budget_debts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget debts" 
ON public.budget_debts FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all budget debts" 
ON public.budget_debts FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create budget_planned_savings table for intentional savings allocations
CREATE TABLE public.budget_planned_savings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  budget_period_id UUID NOT NULL REFERENCES public.budget_periods(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.savings_goals(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  planned_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.budget_planned_savings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budget_planned_savings
CREATE POLICY "Users can view their own planned savings" 
ON public.budget_planned_savings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own planned savings" 
ON public.budget_planned_savings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planned savings" 
ON public.budget_planned_savings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planned savings" 
ON public.budget_planned_savings FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all planned savings" 
ON public.budget_planned_savings FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_budget_periods_updated_at
BEFORE UPDATE ON public.budget_periods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_bills_updated_at
BEFORE UPDATE ON public.budget_bills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_debts_updated_at
BEFORE UPDATE ON public.budget_debts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_planned_savings_updated_at
BEFORE UPDATE ON public.budget_planned_savings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();