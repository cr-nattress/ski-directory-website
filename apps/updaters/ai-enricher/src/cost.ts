import { calculateCost, config } from './config.js';
import { saveCostReport } from './gcs.js';
import { printCostReport } from './output.js';
import type { CostReport } from './types.js';

/**
 * Cost tracker for monitoring OpenAI API usage
 */
export class CostTracker {
  private resorts: CostReport['resorts'] = [];
  private startedAt: Date;
  private model: string;

  constructor(model: string = config.openai.model) {
    this.model = model;
    this.startedAt = new Date();
  }

  /**
   * Add a resort's usage data
   */
  addResort(
    slug: string,
    promptTokens: number,
    completionTokens: number,
    processingTimeMs: number
  ): void {
    const cost = calculateCost(this.model, promptTokens, completionTokens);
    this.resorts.push({
      slug,
      promptTokens,
      completionTokens,
      cost,
      processingTimeMs,
    });
  }

  /**
   * Get the cost report
   */
  getReport(): CostReport {
    const totals = this.resorts.reduce(
      (acc, r) => ({
        resortCount: acc.resortCount + 1,
        totalPromptTokens: acc.totalPromptTokens + r.promptTokens,
        totalCompletionTokens: acc.totalCompletionTokens + r.completionTokens,
        totalCost: acc.totalCost + r.cost,
        totalProcessingTimeMs: acc.totalProcessingTimeMs + r.processingTimeMs,
        avgCostPerResort: 0,
      }),
      {
        resortCount: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        totalCost: 0,
        totalProcessingTimeMs: 0,
        avgCostPerResort: 0,
      }
    );

    totals.avgCostPerResort = totals.resortCount > 0
      ? totals.totalCost / totals.resortCount
      : 0;

    return {
      runId: this.startedAt.toISOString(),
      startedAt: this.startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      model: this.model,
      resorts: this.resorts,
      totals,
    };
  }

  /**
   * Save the cost report to GCS
   */
  async saveReport(): Promise<void> {
    const report = this.getReport();
    await saveCostReport(report);
  }

  /**
   * Print the cost summary to console
   */
  printSummary(): void {
    const report = this.getReport();
    printCostReport(report);
  }

  /**
   * Get current total cost
   */
  getTotalCost(): number {
    return this.resorts.reduce((sum, r) => sum + r.cost, 0);
  }

  /**
   * Get count of resorts processed
   */
  getResortCount(): number {
    return this.resorts.length;
  }
}
