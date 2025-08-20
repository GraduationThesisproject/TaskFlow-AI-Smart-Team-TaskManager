/**
 * Progress Tracking Utility
 * Provides real-time progress tracking for seeding operations
 */

const seederConfig = require('../config/seeder.config');

class ProgressTracker {
  constructor(total = 0, title = 'Progress') {
    this.total = total;
    this.current = 0;
    this.title = title;
    this.startTime = Date.now();
    this.lastUpdate = Date.now();
    this.showProgress = seederConfig.progress.showProgress;
    this.progressBarWidth = seederConfig.progress.progressBarWidth;
    this.updateInterval = seederConfig.progress.updateInterval;
  }

  /**
   * Update progress
   */
  update(increment = 1, message = '') {
    this.current += increment;
    const now = Date.now();

    // Only update display if enough time has passed
    if (now - this.lastUpdate >= this.updateInterval) {
      this.display(message);
      this.lastUpdate = now;
    }
  }

  /**
   * Set progress to specific value
   */
  setProgress(current, message = '') {
    this.current = current;
    this.display(message);
  }

  /**
   * Display progress bar
   */
  display(message = '') {
    if (!this.showProgress) return;

    const percentage = this.total > 0 ? (this.current / this.total) * 100 : 0;
    const filledWidth = Math.round((percentage / 100) * this.progressBarWidth);
    const emptyWidth = this.progressBarWidth - filledWidth;

    const filledBar = '█'.repeat(filledWidth);
    const emptyBar = '░'.repeat(emptyWidth);
    const progressBar = `[${filledBar}${emptyBar}]`;

    const elapsed = Date.now() - this.startTime;
    const elapsedSeconds = Math.floor(elapsed / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const elapsedHours = Math.floor(elapsedMinutes / 60);

    let elapsedText = '';
    if (elapsedHours > 0) {
      elapsedText = `${elapsedHours}h ${elapsedMinutes % 60}m ${elapsedSeconds % 60}s`;
    } else if (elapsedMinutes > 0) {
      elapsedText = `${elapsedMinutes}m ${elapsedSeconds % 60}s`;
    } else {
      elapsedText = `${elapsedSeconds}s`;
    }

    // Calculate ETA
    let etaText = '';
    if (this.current > 0 && this.total > 0) {
      const estimatedTotal = (elapsed / this.current) * this.total;
      const remaining = estimatedTotal - elapsed;
      const remainingSeconds = Math.floor(remaining / 1000);
      const remainingMinutes = Math.floor(remainingSeconds / 60);
      const remainingHours = Math.floor(remainingMinutes / 60);

      if (remainingHours > 0) {
        etaText = `ETA: ${remainingHours}h ${remainingMinutes % 60}m`;
      } else if (remainingMinutes > 0) {
        etaText = `ETA: ${remainingMinutes}m ${remainingSeconds % 60}s`;
      } else {
        etaText = `ETA: ${remainingSeconds}s`;
      }
    }

    // Clear line and display progress
    process.stdout.write('\r');
    process.stdout.write(`${this.title}: ${progressBar} ${percentage.toFixed(1)}% (${this.current}/${this.total}) | ${elapsedText} | ${etaText}`);
    
    if (message) {
      process.stdout.write(` | ${message}`);
    }
  }

  /**
   * Complete progress
   */
  complete(message = '') {
    this.current = this.total;
    this.display(message);
    console.log(); // New line after progress bar
  }

  /**
   * Reset progress
   */
  reset(total = null, title = null) {
    if (total !== null) this.total = total;
    if (title !== null) this.title = title;
    this.current = 0;
    this.startTime = Date.now();
    this.lastUpdate = Date.now();
  }

  /**
   * Get current progress percentage
   */
  getPercentage() {
    return this.total > 0 ? (this.current / this.total) * 100 : 0;
  }

  /**
   * Get elapsed time in milliseconds
   */
  getElapsedTime() {
    return Date.now() - this.startTime;
  }

  /**
   * Get estimated time remaining
   */
  getEstimatedTimeRemaining() {
    if (this.current === 0 || this.total === 0) return null;
    
    const elapsed = this.getElapsedTime();
    const estimatedTotal = (elapsed / this.current) * this.total;
    return estimatedTotal - elapsed;
  }

  /**
   * Create a sub-progress tracker
   */
  createSubProgress(total, title) {
    return new ProgressTracker(total, title);
  }

  /**
   * Log a message without affecting progress bar
   */
  log(message) {
    // Clear current line
    process.stdout.write('\r');
    process.stdout.write(' '.repeat(process.stdout.columns || 80));
    process.stdout.write('\r');
    
    console.log(message);
    
    // Redisplay progress bar
    this.display();
  }

  /**
   * Log an error message
   */
  error(message) {
    this.log(`❌ ${message}`);
  }

  /**
   * Log a warning message
   */
  warning(message) {
    this.log(`⚠️  ${message}`);
  }

  /**
   * Log a success message
   */
  success(message) {
    this.log(`✅ ${message}`);
  }

  /**
   * Log an info message
   */
  info(message) {
    this.log(`ℹ️  ${message}`);
  }
}

/**
 * Multi-step progress tracker
 */
class MultiStepProgressTracker {
  constructor(steps = []) {
    this.steps = steps;
    this.currentStep = 0;
    this.stepProgress = null;
    this.overallProgress = new ProgressTracker(steps.length, 'Overall Progress');
  }

  /**
   * Start a step
   */
  startStep(stepIndex, total = 0) {
    this.currentStep = stepIndex;
    const stepName = this.steps[stepIndex] || `Step ${stepIndex + 1}`;
    this.stepProgress = new ProgressTracker(total, stepName);
    this.overallProgress.setProgress(stepIndex);
    console.log(`\n🚀 Starting: ${stepName}`);
  }

  /**
   * Update current step progress
   */
  updateStep(increment = 1, message = '') {
    if (this.stepProgress) {
      this.stepProgress.update(increment, message);
    }
  }

  /**
   * Complete current step
   */
  completeStep(message = '') {
    if (this.stepProgress) {
      this.stepProgress.complete(message);
    }
    this.overallProgress.update(1);
  }

  /**
   * Complete all steps
   */
  complete(message = '') {
    this.overallProgress.complete(message);
  }

  /**
   * Log message for current step
   */
  log(message) {
    if (this.stepProgress) {
      this.stepProgress.log(message);
    }
  }

  /**
   * Log error for current step
   */
  error(message) {
    if (this.stepProgress) {
      this.stepProgress.error(message);
    }
  }

  /**
   * Log warning for current step
   */
  warning(message) {
    if (this.stepProgress) {
      this.stepProgress.warning(message);
    }
  }

  /**
   * Log success for current step
   */
  success(message) {
    if (this.stepProgress) {
      this.stepProgress.success(message);
    }
  }
}

module.exports = {
  ProgressTracker,
  MultiStepProgressTracker
};
