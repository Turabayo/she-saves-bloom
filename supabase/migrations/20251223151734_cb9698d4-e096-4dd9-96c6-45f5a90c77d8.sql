-- Add last_executed_at column to scheduled_savings for tracking and idempotency
ALTER TABLE public.scheduled_savings 
ADD COLUMN IF NOT EXISTS last_executed_at TIMESTAMP WITH TIME ZONE;

-- Add comment to explain the column
COMMENT ON COLUMN public.scheduled_savings.last_executed_at IS 'Timestamp of the last successful execution, used for idempotency protection';