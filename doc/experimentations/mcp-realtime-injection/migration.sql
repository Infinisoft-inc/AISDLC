-- Migration: Create messages table for MCP real-time conversation experiment
-- Date: 2025-01-06
-- Purpose: Enable real-time conversation bridge between external voice input and Augment Code

-- Create messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  conversation_id UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_role_created ON messages(role, created_at);

-- Enable Row Level Security (optional, can be disabled for experiment)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for experiment (adjust as needed)
CREATE POLICY "Allow all operations on messages" ON messages
  FOR ALL USING (true);

-- Enable real-time subscriptions for the messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Create injection_logs table to track real-time events
CREATE TABLE injection_logs (
  id SERIAL PRIMARY KEY,
  trigger_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_type VARCHAR(50) NOT NULL,
  message_id INTEGER REFERENCES messages(id),
  payload JSONB,
  injection_method VARCHAR(50),
  injection_success BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX idx_injection_logs_timestamp ON injection_logs(trigger_timestamp);
CREATE INDEX idx_injection_logs_message_id ON injection_logs(message_id);

-- Enable real-time subscriptions for the injection_logs table
ALTER PUBLICATION supabase_realtime ADD TABLE injection_logs;

-- Insert a test message to verify setup
INSERT INTO messages (role, content) VALUES
  ('user', 'Test message - MCP real-time experiment setup complete');

-- Verify table creation
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('messages', 'injection_logs')
ORDER BY table_name, ordinal_position;
