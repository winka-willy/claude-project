import { BasePage } from './BasePage.js';

const SELECTORS = {
  username: [
    '#MainContent_txtUserName',
    '#txtUserName',
    '#txtUsername',
    '#txtEmployeeNumber',
    'input[name*="UserName"]',
    'input[name*="Username"]',
    'input[type="text"]',
  ],
  password: [
    '#MainContent_txtPassword',
    '#txtPassword',
    'input[name*="Password"]',
    'input[type="password"]',
  ],
  submit: [
    '#MainContent_btnLogin',
    '#btnLogin',
    'input[value="Login"]',
    'input[value="Log In"]',
    'input[type="submit"]',
    'button[type="submit"]',
    'button:has-text("Login")',
    'a:has-text("Login")',
  ],
};

export class LoginPage extends BasePage {
  /**
   * Returns true if the current URL indicates a login page.
   */
  isOnLoginPage() {
    const url = this.url().toLowerCase();
    return (
      url.includes('login') ||
      url.includes('default') ||
      !url.includes('employeedashboard')
    );
  }

  /**
   * Fills in credentials and submits the login form.
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    console.log(`  Current URL: ${this.url()}`);

    const userSel = await this.findAndFill(SELECTORS.username, email);
    if (!userSel) throw new Error('Could not find username field on login page.');
    console.log(`  Filled username (${userSel})`);

    const passSel = await this.findAndFill(SELECTORS.password, password);
    if (!passSel) throw new Error('Could not find password field on login page.');
    console.log(`  Filled password.`);

    const submitSel = await this.findAndClick(SELECTORS.submit);
    if (!submitSel) throw new Error('Could not find login button.');
    console.log(`  Submitted login (${submitSel})`);

    await this.waitForLoad(30000);
    console.log(`  Post-login URL: ${this.url()}`);
  }
}
