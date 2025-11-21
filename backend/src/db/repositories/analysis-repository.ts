import { db } from '../client';
import { AnalysisResult, ComplianceFinding } from '../../types';
import logger from '../../utils/logger';

export class AnalysisRepository {
  /**
   * Save analysis result with findings
   */
  async saveAnalysis(result: AnalysisResult): Promise<void> {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // Insert analysis
      await client.query(
        `INSERT INTO analyses (
          id, pr_number, repo_full_name, status, analyzed_at, duration,
          total_files, total_findings, critical_count, high_count,
          medium_count, low_count, info_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          result.id,
          result.prNumber,
          result.repoFullName,
          result.status,
          result.analyzedAt,
          result.duration,
          result.stats.totalFiles,
          result.stats.totalFindings,
          result.stats.critical,
          result.stats.high,
          result.stats.medium,
          result.stats.low,
          result.stats.info,
        ]
      );

      // Insert findings
      for (const finding of result.findings) {
        await client.query(
          `INSERT INTO findings (
            id, analysis_id, type, severity, message, file, line, column,
            code, fix_suggestion, rule_id, rule_name
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            finding.id,
            result.id,
            finding.type,
            finding.severity,
            finding.message,
            finding.file,
            finding.line || null,
            finding.column || null,
            finding.code || null,
            finding.fixSuggestion || null,
            finding.ruleId,
            finding.ruleName,
          ]
        );
      }

      await client.query('COMMIT');
      logger.info(`Saved analysis ${result.id} with ${result.findings.length} findings`);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error saving analysis:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get analysis by ID
   */
  async getAnalysis(id: string): Promise<AnalysisResult | null> {
    try {
      const analysisResult = await db.query(
        'SELECT * FROM analyses WHERE id = $1',
        [id]
      );

      if (analysisResult.rows.length === 0) {
        return null;
      }

      const analysis = analysisResult.rows[0];

      const findingsResult = await db.query(
        'SELECT * FROM findings WHERE analysis_id = $1 ORDER BY severity, file, line',
        [id]
      );

      return this.mapToAnalysisResult(analysis, findingsResult.rows);
    } catch (error) {
      logger.error(`Error fetching analysis ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get recent analyses
   */
  async getRecentAnalyses(limit: number = 50): Promise<AnalysisResult[]> {
    try {
      const result = await db.query(
        'SELECT * FROM analyses ORDER BY analyzed_at DESC LIMIT $1',
        [limit]
      );

      return Promise.all(
        result.rows.map(async (row) => {
          const findingsResult = await db.query(
            'SELECT * FROM findings WHERE analysis_id = $1',
            [row.id]
          );
          return this.mapToAnalysisResult(row, findingsResult.rows);
        })
      );
    } catch (error) {
      logger.error('Error fetching recent analyses:', error);
      throw error;
    }
  }

  /**
   * Get analyses for a repository
   */
  async getAnalysesByRepo(repoFullName: string, limit: number = 50): Promise<AnalysisResult[]> {
    try {
      const result = await db.query(
        'SELECT * FROM analyses WHERE repo_full_name = $1 ORDER BY analyzed_at DESC LIMIT $2',
        [repoFullName, limit]
      );

      return Promise.all(
        result.rows.map(async (row) => {
          const findingsResult = await db.query(
            'SELECT * FROM findings WHERE analysis_id = $1',
            [row.id]
          );
          return this.mapToAnalysisResult(row, findingsResult.rows);
        })
      );
    } catch (error) {
      logger.error(`Error fetching analyses for ${repoFullName}:`, error);
      throw error;
    }
  }

  /**
   * Get analysis statistics
   */
  async getStats() {
    try {
      const result = await db.query(`
        SELECT
          COUNT(*) as total_analyses,
          SUM(total_findings) as total_findings,
          SUM(critical_count) as total_critical,
          SUM(high_count) as total_high,
          SUM(medium_count) as total_medium,
          SUM(low_count) as total_low,
          SUM(info_count) as total_info,
          AVG(duration) as avg_duration
        FROM analyses
        WHERE status = 'completed'
      `);

      return result.rows[0];
    } catch (error) {
      logger.error('Error fetching stats:', error);
      throw error;
    }
  }

  /**
   * Map database rows to AnalysisResult
   */
  private mapToAnalysisResult(analysis: any, findings: any[]): AnalysisResult {
    return {
      id: analysis.id,
      prNumber: analysis.pr_number,
      repoFullName: analysis.repo_full_name,
      status: analysis.status,
      findings: findings.map(this.mapToFinding),
      analyzedAt: analysis.analyzed_at,
      duration: analysis.duration,
      stats: {
        totalFiles: analysis.total_files,
        totalFindings: analysis.total_findings,
        critical: analysis.critical_count,
        high: analysis.high_count,
        medium: analysis.medium_count,
        low: analysis.low_count,
        info: analysis.info_count,
      },
    };
  }

  /**
   * Map database row to ComplianceFinding
   */
  private mapToFinding(row: any): ComplianceFinding {
    return {
      id: row.id,
      type: row.type,
      severity: row.severity,
      message: row.message,
      file: row.file,
      line: row.line,
      column: row.column,
      code: row.code,
      fixSuggestion: row.fix_suggestion,
      ruleId: row.rule_id,
      ruleName: row.rule_name,
    };
  }
}

export default AnalysisRepository;

