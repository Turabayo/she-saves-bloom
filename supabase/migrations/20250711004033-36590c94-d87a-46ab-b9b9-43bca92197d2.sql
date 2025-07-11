-- Enable realtime for momo_transactions table
ALTER TABLE public.momo_transactions REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.momo_transactions;