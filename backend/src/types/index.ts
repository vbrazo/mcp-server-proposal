export interface ComplianceFinding {
  id: string;
  type: 'security' | 'license' | 'quality' | 'custom';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  message: string;
  file: string;
  line?: number;
  column?: number;
  code?: string;
  fixSuggestion?: string;
  ruleId: string;
  ruleName: string;
}

export interface AnalysisResult {
  id: string;
  prNumber: number;
  repoFullName: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  findings: ComplianceFinding[];
  analyzedAt: Date;
  duration: number;
  stats: {
    totalFiles: number;
    totalFindings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

export interface CustomRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: 'regex' | 'dependency' | 'license';
  pattern?: string;
  severity: ComplianceFinding['severity'];
  category: ComplianceFinding['type'];
  fixTemplate?: string;
}

export interface PRContext {
  owner: string;
  repo: string;
  prNumber: number;
  branch: string;
  baseBranch: string;
  author: string;
  title: string;
  description: string;
  changedFiles: ChangedFile[];
}

export interface ChangedFile {
  filename: string;
  status: 'added' | 'modified' | 'removed' | 'renamed';
  additions: number;
  deletions: number;
  patch?: string;
  content?: string;
}

export interface E2BAnalysisContext {
  files: ChangedFile[];
  customRules: CustomRule[];
  prContext: PRContext;
}

export interface MCPConfig {
  github: {
    token: string;
    serverUrl?: string;
  };
  filesystem: {
    allowedPaths: string[];
  };
  securityScanners?: {
    enabled: boolean;
    tools: string[];
  };
}

