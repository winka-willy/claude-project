import { chromium } from 'playwright';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';

const SPROUT_URL = 'https://damowagroup.hrhub.ph/EmployeeDashboard.aspx';
const SPROUT_EMAIL = process.env.SPROUT_EMAIL;
const SPROUT_PASSWORD = process.env.SPROUT_PASSWORD;
const HEADED = process.argv.includes('--headed');

async function run() {
  if (!SPROUT_EMAIL || !SPROUT_PASSWORD) {
    console.error('ERROR: SPROUT_EMAIL and SPROUT_PASSWORD environment variables are required.');
    process.exit(1);
  }

  console.log('Starting Sprout HR clock-out...');

  const browser = await chromium.launch({ headless: !HEADED, slowMo: HEADED ? 200 : 0 });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  try {
    console.log(`Navigating to ${SPROUT_URL}...`);
    await page.goto(SPROUT_URL, { waitUntil: 'networkidle', timeout: 30000 });

    if (loginPage.isOnLoginPage()) {
      console.log('Login required. Authenticating...');
      await loginPage.login(SPROUT_EMAIL, SPROUT_PASSWORD);
    } else {
      console.log('Already on dashboard (session still active).');
    }

    await dashboardPage.waitForLoad(15000);

    if (loginPage.isOnLoginPage()) {
      await loginPage.saveScreenshot('login-failed');
      throw new Error('Login failed — still on login page. Check credentials.');
    }

    console.log('On dashboard. Looking for Time Out button...');
    await dashboardPage.saveScreenshot('dashboard');

    const clicked = await dashboardPage.clickTimeOut();

    if (!clicked) {
      await dashboardPage.saveScreenshot('timeout-button-not-found');
      throw new Error(
        'Could not find the Time Out button. A screenshot has been saved to logs/ for debugging.'
      );
    }

    await dashboardPage.handleConfirmation();
    await dashboardPage.saveScreenshot('clocked-out');

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    console.log(`\n✓ Successfully clocked out at ${timeStr} on ${dateStr}`);
  } catch (err) {
    console.error(`\nERROR: ${err.message}`);
    await dashboardPage.saveScreenshot('error');
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
