-- Create income table
CREATE TABLE public.income (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  source TEXT NOT NULL,
  note TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user access
CREATE POLICY "Users can view their own income" 
ON public.income 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own income" 
ON public.income 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income" 
ON public.income 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income" 
ON public.income 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policy for admins to view all income
CREATE POLICY "Admins can view all income" 
ON public.income 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create scheduled_savings table
CREATE TABLE public.scheduled_savings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_id UUID,
  amount NUMERIC NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'one-time')),
  next_execution_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scheduled_savings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for scheduled savings
CREATE POLICY "Users can view their own scheduled savings" 
ON public.scheduled_savings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduled savings" 
ON public.scheduled_savings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled savings" 
ON public.scheduled_savings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled savings" 
ON public.scheduled_savings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policy for admins to view all scheduled savings
CREATE POLICY "Admins can view all scheduled savings" 
ON public.scheduled_savings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates on scheduled_savings
CREATE TRIGGER update_scheduled_savings_updated_at
BEFORE UPDATE ON public.scheduled_savings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();