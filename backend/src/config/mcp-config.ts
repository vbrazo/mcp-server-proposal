import { MCPConfig } from '../types';

/**
 * MCP (Model Context Protocol) Configuration
 * Defines tools available in E2B sandboxes for code analysis
 */

export function getMCPConfig(githubToken: string): MCPConfig {
  return {
    github: {
      token: githubToken,
      // GitHub MCP server configuration
      // Provides: repo access, file reading, PR operations
      serverUrl: process.env.GITHUB_MCP_SERVER_URL,
    },
    filesystem: {
      // Paths accessible within E2B sandbox
      allowedPaths: ['/workspace', '/tmp'],
    },
    securityScanners: {
      enabled: true,
      // Additional MCP tools for security scanning
      // These would be Docker-based MCP servers
      tools: [
        'semgrep', // Static analysis
        'trufflehog', // Secret scanning
        'safety', // Python dependency checker
        'npm-audit', // Node.js dependency checker
      ],
    },
  };
}

/**
 * MCP Server Definitions for E2B
 * These are executed within the E2B sandbox environment
 */
export const mcpServers = {
  github: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    env: {
      GITHUB_PERSONAL_ACCESS_TOKEN: '{{GITHUB_TOKEN}}',
    },
  },
  filesystem: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/workspace'],
  },
};

/**
 * Tools available through MCP in E2B sandbox
 */
export const availableTools = [
  // GitHub MCP Tools
  {
    name: 'github_get_file_contents',
    description: 'Get contents of a file from GitHub repository',
    parameters: {
      owner: 'string',
      repo: 'string',
      path: 'string',
      ref: 'string (optional)',
    },
  },
  {
    name: 'github_list_commits',
    description: 'List commits in a pull request',
    parameters: {
      owner: 'string',
      repo: 'string',
      pull_number: 'number',
    },
  },
  {
    name: 'github_create_review_comment',
    description: 'Create a review comment on a pull request',
    parameters: {
      owner: 'string',
      repo: 'string',
      pull_number: 'number',
      body: 'string',
      path: 'string',
      line: 'number',
    },
  },
  // Filesystem MCP Tools
  {
    name: 'read_file',
    description: 'Read file contents from sandbox filesystem',
    parameters: {
      path: 'string',
    },
  },
  {
    name: 'write_file',
    description: 'Write file contents to sandbox filesystem',
    parameters: {
      path: 'string',
      content: 'string',
    },
  },
  {
    name: 'list_directory',
    description: 'List contents of a directory',
    parameters: {
      path: 'string',
    },
  },
];
