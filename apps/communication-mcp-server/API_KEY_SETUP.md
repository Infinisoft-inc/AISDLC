# API Key Authentication Setup

## Overview
The MCP server now supports optional API key authentication for enhanced user isolation and message persistence.

## Setup

### 1. Generate API Key
1. Go to your AI-SDLC account page: https://ai-sdlc.vercel.app/account
2. Scroll to "MCP Authentication Token" section
3. Select "API Key (Recommended)" 
4. Enter a name for your key (e.g., "My MCP Server")
5. Click "Generate API Key"
6. Copy the generated API key (format: `aisdlc_xxxxxxxx_...`)

### 2. Configure Environment Variable
Set the API key as an environment variable:

```bash
export MCP_API_KEY="aisdlc_a1b2c3d4_your_actual_api_key_here"
```

Or create a `.env` file:
```
MCP_API_KEY=aisdlc_a1b2c3d4_your_actual_api_key_here
```

### 3. Run MCP Server
Start the server normally - it will automatically use the API key if present:

```bash
npm start
```

## Behavior

### With API Key
- ✅ Messages are associated with your user account
- ✅ Messages persist in Supabase database
- ✅ User isolation - only you see your messages
- ✅ Enhanced logging and tracking

### Without API Key (Backward Compatible)
- ✅ Server works exactly as before
- ✅ Messages stored in memory only
- ✅ No user association
- ✅ Anonymous operation

## Verification

Check the server logs when starting:
- With API key: Headers will include `Authorization: Bearer aisdlc_...`
- Without API key: Standard headers only

## Security Notes

- API keys never expire (until revoked)
- Keep your API key secure and private
- You can revoke keys anytime from the account page
- Each user should have their own API key
