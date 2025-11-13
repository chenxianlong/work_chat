# GitHub MCP Server Setup

This directory contains the configuration for the GitHub MCP Server.

## Configuration

The GitHub MCP Server has been configured using the remote server option in `../cline_mcp_settings.json`.

### Server Details
- **Server Name**: `github.com/github/github-mcp-server`
- **Type**: HTTP (Remote)
- **URL**: `https://api.githubcopilot.com/mcp/`
- **Authentication**: GitHub Personal Access Token (PAT)

## Prerequisites

To use this MCP server, you need:

1. A GitHub Personal Access Token with appropriate permissions
2. The token should include scopes like:
   - `repo` - Repository operations
   - `read:packages` - Docker image access
   - `read:org` - Organization team access

## Usage

When the MCP host starts, it will prompt for your GitHub Personal Access Token. Enter your token when prompted to authenticate with the GitHub API.

## Available Tools

The GitHub MCP Server provides access to numerous GitHub API tools including:

- Repository management (browse, search, analyze code)
- Issue & Pull Request automation
- GitHub Actions workflows
- Code security analysis
- Team collaboration tools
- And much more...

## Security Notes

- Keep your GitHub PAT secure and never commit it to version control
- Use tokens with minimal required permissions
- Consider using environment variables for token management in production

## Next Steps

1. Restart your MCP host to load the new server configuration
2. Provide your GitHub PAT when prompted
3. Start using GitHub tools through natural language interactions
