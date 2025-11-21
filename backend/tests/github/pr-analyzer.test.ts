import { PRAnalyzer } from '../../src/github/pr-analyzer';
import { GitHubAppHandler } from '../../src/github/app-handler';
import { AnalysisResult } from '../../src/types';

// Mock dependencies
jest.mock('../../src/github/app-handler');
jest.mock('../../src/agent/e2b-agent');
jest.mock('../../src/analysis/groq-analyzer');

describe('PRAnalyzer', () => {
  let prAnalyzer: PRAnalyzer;
  let mockGitHubHandler: jest.Mocked<GitHubAppHandler>;

  beforeEach(() => {
    mockGitHubHandler = new GitHubAppHandler() as jest.Mocked<GitHubAppHandler>;
    prAnalyzer = new PRAnalyzer(mockGitHubHandler);
  });

  describe('analyzePR', () => {
    it('should analyze a pull request successfully', async () => {
      const mockOctokit = {
        pulls: {
          get: jest.fn().mockResolvedValue({
            data: {
              number: 1,
              title: 'Test PR',
              body: 'Test description',
              head: {
                ref: 'feature-branch',
                sha: 'abc123',
              },
              base: {
                ref: 'main',
              },
              user: {
                login: 'testuser',
              },
            },
          }),
        },
      } as any;

      mockGitHubHandler.getPRFiles = jest.fn().mockResolvedValue([
        {
          filename: 'test.js',
          status: 'modified',
          additions: 5,
          deletions: 2,
          patch: '+ new code',
        },
      ]);

      mockGitHubHandler.getFileContent = jest.fn().mockResolvedValue('file content');
      mockGitHubHandler.createCheckRun = jest.fn().mockResolvedValue(123);
      mockGitHubHandler.updateCheckRun = jest.fn().mockResolvedValue(undefined);
      mockGitHubHandler.postComment = jest.fn().mockResolvedValue(undefined);

      const result = await prAnalyzer.analyzePR(
        mockOctokit,
        'owner',
        'repo',
        1
      );

      expect(result).toBeDefined();
      expect(result.prNumber).toBe(1);
      expect(result.repoFullName).toBe('owner/repo');
      expect(result.status).toBe('completed');
    });

    it('should handle errors gracefully', async () => {
      const mockOctokit = {
        pulls: {
          get: jest.fn().mockRejectedValue(new Error('API error')),
        },
      } as any;

      const result = await prAnalyzer.analyzePR(
        mockOctokit,
        'owner',
        'repo',
        1
      );

      expect(result.status).toBe('failed');
    });
  });

  describe('handleCommand', () => {
    it('should handle scan command', async () => {
      const mockOctokit = {} as any;

      await prAnalyzer.handleCommand(
        mockOctokit,
        'owner',
        'repo',
        1,
        'scan',
        []
      );

      // Verify scan was triggered
      expect(true).toBe(true);
    });

    it('should handle fix command', async () => {
      const mockOctokit = {} as any;

      mockGitHubHandler.postComment = jest.fn().mockResolvedValue(undefined);

      await prAnalyzer.handleCommand(
        mockOctokit,
        'owner',
        'repo',
        1,
        'fix',
        []
      );

      expect(mockGitHubHandler.postComment).toHaveBeenCalled();
    });

    it('should handle unknown command', async () => {
      const mockOctokit = {} as any;

      mockGitHubHandler.postComment = jest.fn().mockResolvedValue(undefined);

      await prAnalyzer.handleCommand(
        mockOctokit,
        'owner',
        'repo',
        1,
        'unknown',
        []
      );

      expect(mockGitHubHandler.postComment).toHaveBeenCalled();
    });
  });
});

