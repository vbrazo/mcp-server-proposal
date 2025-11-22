import { CodeInterpreter } from '@e2b/code-interpreter';
import { E2BAnalysisContext, ComplianceFinding, ChangedFile } from '../types';
import { getMCPConfig, mcpServers } from '../config/mcp-config';
import config from '../config';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class E2BAgent {
  private sandbox: CodeInterpreter | null = null;
  private githubToken: string;

  constructor(githubToken: string) {
    this.githubToken = githubToken;
  }

  /**
   * Initialize E2B sandbox with MCP tools
   */
  async initialize(): Promise<void> {
    logger.info('Initializing E2B sandbox...');

    try {
      this.sandbox = await CodeInterpreter.create({
        apiKey: config.E2B_API_KEY,
        metadata: {
          purpose: 'compliance-analysis',
          timestamp: new Date().toISOString(),
        },
      });

      logger.info(`E2B sandbox created: ${this.sandbox.sandboxId}`);

      // Setup MCP servers in sandbox
      await this.setupMCPServers();

      logger.info('E2B sandbox initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize E2B sandbox:', error);
      throw new Error('E2B sandbox initialization failed');
    }
  }

  /**
   * Setup MCP servers within the E2B sandbox
   */
  private async setupMCPServers(): Promise<void> {
    if (!this.sandbox) {
      throw new Error('Sandbox not initialized');
    }

    logger.info('Setting up MCP servers in sandbox...');

    try {
      // Install MCP server packages
      const installScript = `
      import subprocess
      import os

      # Install Node.js MCP servers
      subprocess.run(['npm', 'install', '-g', '@modelcontextprotocol/server-github', '@modelcontextprotocol/server-filesystem'], check=True)

      print("MCP servers installed successfully")
      `;

      const result = await this.sandbox.notebook.execCell(installScript);
      logger.info('MCP servers installed:', result.logs);

      // Configure GitHub MCP with token
      const configScript = `
      import os
      os.environ['GITHUB_PERSONAL_ACCESS_TOKEN'] = '${this.githubToken}'
      print("GitHub MCP configured")
      `;

      await this.sandbox.notebook.execCell(configScript);
      logger.info('MCP servers configured');
    } catch (error) {
      logger.error('Error setting up MCP servers:', error);
      throw error;
    }
  }

  /**
   * Analyze code using E2B sandbox with MCP tools
   */
  async analyzeWithMCP(context: E2BAnalysisContext): Promise<ComplianceFinding[]> {
    if (!this.sandbox) {
      await this.initialize();
    }

    logger.info(`Starting E2B analysis for PR #${context.prContext.prNumber}`);

    try {
      // Create workspace directory
      await this.setupWorkspace(context);

      // Run analysis script with MCP tools
      const findings = await this.runAnalysis(context);

      logger.info(`E2B analysis complete: ${findings.length} findings`);
      return findings;
    } catch (error) {
      logger.error('Error during E2B analysis:', error);
      throw error;
    }
  }

  /**
   * Setup workspace in sandbox with changed files
   */
  private async setupWorkspace(context: E2BAnalysisContext): Promise<void> {
    if (!this.sandbox) {
      throw new Error('Sandbox not initialized');
    }

    logger.info('Setting up workspace with changed files...');

    const setupScript = `
      import os
      import json

      # Create workspace directory
      os.makedirs('/workspace', exist_ok=True)

      # Write changed files
      files = ${JSON.stringify(context.files.map(f => ({
        filename: f.filename,
        content: f.content || '',
        status: f.status,
      })))}

      for file_data in files:
          filepath = os.path.join('/workspace', file_data['filename'])
          os.makedirs(os.path.dirname(filepath), exist_ok=True)
          
          with open(filepath, 'w') as f:
              f.write(file_data['content'])

      print(f"Setup {len(files)} files in workspace")
      `;

    await this.sandbox.notebook.execCell(setupScript);
    logger.info('Workspace setup complete');
  }

  /**
   * Run comprehensive analysis using MCP tools
   */
  private async runAnalysis(context: E2BAnalysisContext): Promise<ComplianceFinding[]> {
    if (!this.sandbox) {
      throw new Error('Sandbox not initialized');
    }

    const analysisScript = `
      import os
      import json
      import re
      import subprocess

      findings = []

      # Security analysis using filesystem MCP
      def analyze_security(filepath, content):
          issues = []
          
          # Check for secrets
          secret_patterns = {
              'api_key': r'(api[_-]?key|apikey)\\s*[=:]\\s*["\']([A-Za-z0-9_\\-]{20,})["\']',
              'aws_key': r'(AKIA[0-9A-Z]{16})',
              'private_key': r'-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----',
              'password': r'(password|passwd|pwd)\\s*[=:]\\s*["\'][^"\']{8,}["\']',
          }
          
          for pattern_name, pattern in secret_patterns.items():
              matches = re.finditer(pattern, content, re.IGNORECASE)
              for match in matches:
                  line_num = content[:match.start()].count('\\n') + 1
                  issues.append({
                      'type': 'security',
                      'severity': 'critical',
                      'message': f'Hardcoded secret detected: {pattern_name}',
                      'file': filepath,
                      'line': line_num,
                      'code': match.group(0),
                      'ruleName': 'Secret Detection'
                  })
          
          return issues

      # Analyze each file in workspace
      for root, dirs, files in os.walk('/workspace'):
          for filename in files:
              filepath = os.path.join(root, filename)
              relative_path = os.path.relpath(filepath, '/workspace')
              
              try:
                  with open(filepath, 'r') as f:
                      content = f.read()
                  
                  # Run security analysis
                  file_findings = analyze_security(relative_path, content)
                  findings.extend(file_findings)
                  
              except Exception as e:
                  print(f"Error analyzing {relative_path}: {e}")

      # Output findings as JSON
      print(json.dumps({'findings': findings}, indent=2))
      `;

    try {
      const result = await this.sandbox.notebook.execCell(analysisScript);
      
      if (result.error) {
        logger.error('Analysis script error:', result.error);
        return [];
      }

      // Parse findings from output
      const output = result.logs.stdout.join('\n') + result.logs.stderr.join('\n');
      const findings = this.parseAnalysisOutput(output);

      return findings;
    } catch (error) {
      logger.error('Error running analysis script:', error);
      return [];
    }
  }

  /**
   * Parse analysis output into findings
   */
  private parseAnalysisOutput(output: string): ComplianceFinding[] {
    try {
      // Extract JSON from output
      const jsonMatch = output.match(/\{[\s\S]*"findings"[\s\S]*\}/);
      if (!jsonMatch) {
        logger.warn('No findings JSON found in output');
        return [];
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.findings || !Array.isArray(parsed.findings)) {
        return [];
      }

      return parsed.findings.map((finding: any) => ({
        id: uuidv4(),
        type: finding.type || 'security',
        severity: finding.severity || 'medium',
        message: finding.message,
        file: finding.file,
        line: finding.line,
        column: finding.column,
        code: finding.code,
        fixSuggestion: finding.fixSuggestion,
        ruleId: `e2b-${finding.type}`,
        ruleName: finding.ruleName || 'E2B Analysis',
      }));
    } catch (error) {
      logger.error('Error parsing analysis output:', error);
      return [];
    }
  }

  /**
   * Use GitHub MCP to fetch file contents
   */
  async fetchFileFromGitHub(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<string | null> {
    if (!this.sandbox) {
      await this.initialize();
    }

    const script = `
import subprocess
import json

# Use GitHub MCP to fetch file
result = subprocess.run(
    ['gh-mcp', 'get-file', '--owner', '${owner}', '--repo', '${repo}', '--path', '${path}'${ref ? `, '--ref', '${ref}'` : ''}],
    capture_output=True,
    text=True
)

if result.returncode == 0:
    print(result.stdout)
else:
    print(json.dumps({'error': result.stderr}))
`;

    try {
      const result = await this.sandbox!.notebook.execCell(script);
      const output = result.logs.stdout.join('\n');
      
      if (output.includes('error')) {
        return null;
      }

      return output;
    } catch (error) {
      logger.error('Error fetching file from GitHub:', error);
      return null;
    }
  }

  /**
   * Execute custom security scanners via MCP
   */
  async runSecurityScan(files: ChangedFile[]): Promise<ComplianceFinding[]> {
    if (!this.sandbox) {
      await this.initialize();
    }

    logger.info('Running security scanners in E2B sandbox...');

    const scanScript = `
import subprocess
import json

findings = []

# Run Semgrep for static analysis
try:
    result = subprocess.run(
        ['semgrep', '--json', '--config=auto', '/workspace'],
        capture_output=True,
        text=True,
        timeout=60
    )
    
    if result.returncode == 0:
        semgrep_results = json.loads(result.stdout)
        for finding in semgrep_results.get('results', []):
            findings.append({
                'type': 'security',
                'severity': 'high',
                'message': finding.get('extra', {}).get('message', 'Security issue detected'),
                'file': finding.get('path', '').replace('/workspace/', ''),
                'line': finding.get('start', {}).get('line'),
                'ruleName': 'Semgrep'
            })
except Exception as e:
    print(f"Semgrep error: {e}")

print(json.dumps({'findings': findings}, indent=2))
`;

    try {
      const result = await this.sandbox.notebook.execCell(scanScript);
      const output = result.logs.stdout.join('\n');
      return this.parseAnalysisOutput(output);
    } catch (error) {
      logger.error('Error running security scan:', error);
      return [];
    }
  }

  /**
   * Cleanup and destroy sandbox
   */
  async cleanup(): Promise<void> {
    if (this.sandbox) {
      logger.info(`Cleaning up E2B sandbox: ${this.sandbox.sandboxId}`);
      
      try {
        await this.sandbox.close();
        this.sandbox = null;
        logger.info('E2B sandbox cleaned up successfully');
      } catch (error) {
        logger.error('Error cleaning up sandbox:', error);
      }
    }
  }

  /**
   * Get sandbox info
   */
  getSandboxInfo() {
    return this.sandbox ? {
      sandboxId: this.sandbox.sandboxId,
      status: 'running',
    } : {
      sandboxId: null,
      status: 'not_initialized',
    };
  }
}

export default E2BAgent;

