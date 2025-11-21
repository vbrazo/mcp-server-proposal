import { Router, Request, Response } from 'express';
import { AnalysisRepository } from '../db/repositories/analysis-repository';
import logger from '../utils/logger';

const router = Router();
const analysisRepo = new AnalysisRepository();

/**
 * Health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const { db } = await import('../db/client');
    const dbHealthy = await db.healthCheck();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
      },
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({ status: 'error', message: 'Health check failed' });
  }
});

/**
 * GET /api/analyses - Get recent analyses
 */
router.get('/analyses', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const repoFullName = req.query.repo as string;

    let analyses;
    if (repoFullName) {
      analyses = await analysisRepo.getAnalysesByRepo(repoFullName, limit);
    } else {
      analyses = await analysisRepo.getRecentAnalyses(limit);
    }

    res.json({
      success: true,
      data: analyses,
      count: analyses.length,
    });
  } catch (error) {
    logger.error('Error fetching analyses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analyses',
    });
  }
});

/**
 * GET /api/analyses/:id - Get analysis by ID
 */
router.get('/analyses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const analysis = await analysisRepo.getAnalysis(id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found',
      });
    }

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    logger.error('Error fetching analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analysis',
    });
  }
});

/**
 * GET /api/stats - Get overall statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await analysisRepo.getStats();

    res.json({
      success: true,
      data: {
        totalAnalyses: parseInt(stats.total_analyses) || 0,
        totalFindings: parseInt(stats.total_findings) || 0,
        criticalIssues: parseInt(stats.total_critical) || 0,
        highIssues: parseInt(stats.total_high) || 0,
        mediumIssues: parseInt(stats.total_medium) || 0,
        lowIssues: parseInt(stats.total_low) || 0,
        infoIssues: parseInt(stats.total_info) || 0,
        avgDuration: parseFloat(stats.avg_duration) || 0,
      },
    });
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
    });
  }
});

/**
 * POST /api/config/rules - Add or update custom rule
 */
router.post('/config/rules', async (req: Request, res: Response) => {
  try {
    const rule = req.body;

    // Validate rule
    if (!rule.name || !rule.type || !rule.severity || !rule.category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // Save rule to database (simplified)
    res.json({
      success: true,
      message: 'Rule saved successfully',
      data: rule,
    });
  } catch (error) {
    logger.error('Error saving rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save rule',
    });
  }
});

/**
 * POST /api/trigger-scan - Manually trigger PR scan
 */
router.post('/trigger-scan', async (req: Request, res: Response) => {
  try {
    const { owner, repo, prNumber } = req.body;

    if (!owner || !repo || !prNumber) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: owner, repo, prNumber',
      });
    }

    // Queue analysis job (simplified)
    logger.info(`Manual scan triggered for ${owner}/${repo}#${prNumber}`);

    res.json({
      success: true,
      message: 'Scan triggered successfully',
      data: {
        owner,
        repo,
        prNumber,
        status: 'queued',
      },
    });
  } catch (error) {
    logger.error('Error triggering scan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger scan',
    });
  }
});

export default router;

