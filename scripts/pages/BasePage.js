import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', 'logs');

export class BasePage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Saves a full-page screenshot to the logs/ directory.
   * @param {string} name - Label prefix for the filename.
   */
  async saveScreenshot(name) {
    try {
      if (!fs.existsSync(SCREENSHOTS_DIR)) {
        fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
      }
      const file = path.join(SCREENSHOTS_DIR, `${name}-${Date.now()}.png`);
      await this.page.screenshot({ path: file, fullPage: true });
      console.log(`  [screenshot saved: logs/${path.basename(file)}]`);
    } catch {}
  }

  /**
   * Tries a list of selectors in order and clicks the first VISIBLE match.
   * Checks all DOM matches per selector (not just the first) to handle
   * cases where hidden duplicates appear before the visible element.
   * @param {string[]} selectors
   * @returns {Promise<string|null>} The matched selector, or null if none found.
   */
  async findAndClick(selectors) {
    for (const sel of selectors) {
      try {
        const els = await this.page.$$(sel);
        for (const el of els) {
          if (await el.isVisible()) {
            await el.click();
            return sel;
          }
        }
      } catch {}
    }
    return null;
  }

  /**
   * Tries a list of selectors in order and fills the first VISIBLE match.
   * @param {string[]} selectors
   * @param {string} value
   * @returns {Promise<string|null>} The matched selector, or null if none found.
   */
  async findAndFill(selectors, value) {
    for (const sel of selectors) {
      try {
        const els = await this.page.$$(sel);
        for (const el of els) {
          if (await el.isVisible()) {
            await el.fill(value);
            return sel;
          }
        }
      } catch {}
    }
    return null;
  }

  url() {
    return this.page.url();
  }

  async waitForLoad(timeout = 30000) {
    await this.page.waitForLoadState('networkidle', { timeout });
  }
}
