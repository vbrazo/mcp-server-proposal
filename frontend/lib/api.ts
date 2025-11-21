import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export interface Stats {
  totalAnalyses: number;
  totalFindings: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  infoIssues: number;
  avgDuration: number;
}

// API methods
export const analysisApi = {
  getRecentAnalyses: async (limit = 50): Promise<AnalysisResult[]> => {
    const response = await api.get('/analyses', { params: { limit } });
    return response.data.data;
  },

  getAnalysis: async (id: string): Promise<AnalysisResult> => {
    const response = await api.get(`/analyses/${id}`);
    return response.data.data;
  },

  getAnalysesByRepo: async (repo: string, limit = 50): Promise<AnalysisResult[]> => {
    const response = await api.get('/analyses', { params: { repo, limit } });
    return response.data.data;
  },

  getStats: async (): Promise<Stats> => {
    const response = await api.get('/stats');
    return response.data.data;
  },

  triggerScan: async (owner: string, repo: string, prNumber: number) => {
    const response = await api.post('/trigger-scan', { owner, repo, prNumber });
    return response.data;
  },
};

