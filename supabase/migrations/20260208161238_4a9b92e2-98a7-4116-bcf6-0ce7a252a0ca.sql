-- Enable realtime for call_logs table so the DB-based call notification works
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_logs;