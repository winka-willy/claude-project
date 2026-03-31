import { BasePage } from './BasePage.js';

const SELECTORS = {
  // Dismiss any welcome/info modal that may appear on load
  dismissModal: [
    'button.btn:has-text("OK")',
    'button:has-text("OK")',
  ],
  // Use class selector — the button text has extra whitespace that breaks :has-text()
  clockInOutDropdown: '.dsk-btn',
  clockOutLink: [
    'a.dropdown-item:has-text("Clock Out")',
    '.dropdown-menu a:has-text("Clock Out")',
    'a:has-text("Clock Out")',
  ],
  confirmClockOut: [
    'button.our-button',                           // Sprout bootbox confirm button
    'button.btn-success:has-text("Clock Me Out")',
    'button:has-text("Clock Me Out")',
    'button.btn-success:has-text("OK")',
    'button:has-text("OK")',
    'button.btn-success:has-text("Yes")',
    'button:has-text("Yes")',
  ],
};

export class DashboardPage extends BasePage {
  /**
   * Waits for the Clock In/Out dropdown to be ready, dismissing any
   * blocking modals first, then opens the dropdown and clicks Clock Out.
   * @returns {Promise<boolean>} True if clocked out successfully.
   */
  async clickTimeOut() {
    // Give async widgets time to render after networkidle
    await this.page.waitForTimeout(3000);

    // Dismiss any modal that may be blocking the page (e.g. welcome popup)
    await this._dismissBlockingModal();

    // Wait for the attendance widget to render (it loads asynchronously)
    console.log('  Waiting for Clock In/Out button...');
    try {
      await this.page.waitForSelector(SELECTORS.clockInOutDropdown, { state: 'attached', timeout: 15000 });
    } catch {
      console.log('  Clock In/Out button did not appear within 15s.');
      return false;
    }

    // Step 1: Open the dropdown
    await this.page.click(SELECTORS.clockInOutDropdown);
    console.log('  Opened Clock In/Out dropdown.');

    // Wait for dropdown menu to expand
    await this.page.waitForTimeout(600);

    // Step 2: Click "Clock Out" from the dropdown
    try {
      // Try each clockOutLink selector
      let clicked = false;
      for (const sel of SELECTORS.clockOutLink) {
        const el = await this.page.$(sel);
        if (el) {
          await el.click({ force: true });
          console.log(`  Clicked Clock Out (${sel})`);
          clicked = true;
          break;
        }
      }
      if (!clicked) {
        console.log('  Could not find Clock Out option in dropdown.');
        return false;
      }
    } catch (e) {
      console.log('  Error clicking Clock Out:', e.message);
      return false;
    }

    return true;
  }

  /**
   * Confirms the "Clock Me Out" modal.
   */
  async handleConfirmation() {
    await this.page.waitForTimeout(1500);

    const sel = await this.findAndClick(SELECTORS.confirmClockOut);
    if (sel) {
      console.log(`  Confirmed clock-out modal (${sel})`);
      await this.page.waitForTimeout(1500);
    }
  }

  /**
   * Closes any blocking modal (e.g. OK popup on dashboard load).
   */
  async _dismissBlockingModal() {
    for (const sel of SELECTORS.dismissModal) {
      try {
        const el = await this.page.$(sel);
        if (el && (await el.isVisible())) {
          await el.click();
          console.log(`  Dismissed modal (${sel})`);
          await this.page.waitForTimeout(500);
          return;
        }
      } catch {}
    }
  }
}
