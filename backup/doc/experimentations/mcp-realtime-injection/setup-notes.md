# Setup Notes - MCP Real-time Injection Experiment

**Date**: 2025-01-06  
**Status**: In Progress

## Environment Configuration

### Supabase Cloud Setup
- **Status**: ✅ Complete (existing AINDOC infrastructure)
- **Database**: Cloud-hosted Supabase instance
- **Features**: Authentication, real-time subscriptions, row-level security
- **Integration**: Next.js application with Stripe payments

### Local Development Setup
- **Supabase CLI**: Installing for local access and migrations
- **Connection**: Linking local environment to cloud instance
- **Purpose**: Enable easy table creation and real-time testing

## MCP Server Requirements

### Dependencies
```json
{
  "@supabase/supabase-js": "^2.x",
  "dotenv": "^16.x"
}
```

### Environment Variables
```env
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Test Table Schema
```sql
CREATE TABLE mcp_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE
);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE mcp_events;
```

## Implementation Plan

### MCP Server Structure
1. **Base MCP Server**: Standard JSON-RPC over STDIO
2. **Supabase Client**: Real-time subscription handler
3. **STDIO Injection**: Method to push unsolicited data
4. **Event Queue**: Buffer for managing real-time events

### Test Scenarios
1. **Basic Injection**: Simple text data to STDIO
2. **JSON Injection**: Structured data mimicking MCP responses
3. **Conversation Integration**: Updates during active dialogue
4. **Idle State Testing**: Updates when agent is not engaged

## Progress Tracking

### Completed
- [x] Experiment documentation structure
- [x] Technical requirements analysis
- [x] Test scenario planning

### In Progress
- [ ] Supabase CLI setup and cloud connection
- [ ] MCP server implementation with Supabase integration
- [ ] Test table creation and real-time subscription setup

### Pending
- [ ] STDIO injection mechanism implementation
- [ ] Test execution and behavior documentation
- [ ] Results analysis and pattern identification

## Notes and Observations

### Setup Challenges
*[To be documented during implementation]*

### Configuration Issues
*[To be documented during implementation]*

### Unexpected Behaviors
*[To be documented during testing]*

## Next Steps
1. Complete Supabase CLI setup
2. Create test table with real-time enabled
3. Implement basic MCP server with Supabase client
4. Begin STDIO injection testing
