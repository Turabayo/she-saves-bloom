-- Create topups table for MTN MoMo Collection payments
CREATE TABLE public.topups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'EUR',
  external_id TEXT NOT NULL,
  momo_reference_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  momo_transaction_id TEXT,
  payer_message TEXT,
  payee_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.topups ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own topups" 
ON public.topups 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own topups" 
ON public.topups 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own topups" 
ON public.topups 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all topups" 
ON public.topups 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_topups_updated_at
BEFORE UPDATE ON public.topups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();