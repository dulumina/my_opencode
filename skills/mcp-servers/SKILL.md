---
name: mcp-servers
description: Reference catalog and configuration guide for MCP servers in OpenCode.
---
# MCP Servers Skill
**MCP Server Catalog Migrated from Hermes**

*Provides access to 65 MCP servers migrated from Hermes framework*

## Overview

This skill provides access to the 65 MCP servers that were migrated from Hermes to Opencode. The servers are organized by category with full descriptions and can be queried by name or category.

## Configuration

The MCP server data is loaded from `/home/fikri/.opencode/mcp_servers.yaml` and parsed at skill activation.

## Available Functions

### `findServer(name)`

Find an MCP server by name (case-insensitive).

**Parameters:**
- `name` (string, required): Name of the MCP server to find

**Returns:**
- `object` - Server details including name, source, category, description
- `null` - If server not found

**Example:**
```
findServer("gitlab")
```
Returns: `{ name: "gitlab", source: "hermes", category: "devops", description: "GitLab: issues, merge requests, pipelines, and repo context" }`

### `listServersByCategory(category)`

List all MCP servers in a specific category.

**Parameters:**
- `category` (string, required): Category to filter by

**Returns:**
- `array` - Array of server objects matching the category

**Example:**
```
listServersByCategory("devops")
```
Returns: Array of devops MCP servers (atlassian, buildkite, circleci, gitlab)

### `getAllServerNames()`

Get all MCP server names.

**Returns:**
- `array` - Array of 65 server name strings

### `getAllCategories()`

Get all unique categories available.

**Returns:**
- `array` - Array of 38 unique category strings

### `getServerMetadata(name)`

Get category and description for a server.

**Parameters:**
- `name` (string, required): Server name

**Returns:**
- `object` - `{ category: string, description: string }` or `null`

## Built-in Server Categories

The 65 migrated servers span these 38 categories:

- productivity, search, outdoors, analytics, devops, crm, aws, monitoring
- design, sales, infrastructure, media, creative, documentation, research
- storage, networking, ml, job-search, communications, travel, marketing
- project-management, collaboration, database, workflow, hosting
- knowledge-base, payments, finance, apis, trading, security
- fitness, market-data, gaming, knowledge, cms

## Usage in Opencode

This skill can be activated automatically when users mention MCP servers, or manually invoked via the skill system.

**Example queries:**
- "Find the gitlab MCP server"
- "List all devops MCP servers"
- "What MCP servers are available for productivity?"
- "Show me all MCP server categories"

## Integration

The skill data is also available via the JavaScript module at `/home/fikri/.opencode/mcp_servers.js` for programmatic access:

```javascript
const { findServer, listServersByCategory } = require('/home/fikri/.opencode/mcp_servers');
```