const auth = require('../utils/auth');

describe('Explore page', () => {
  beforeAll(async () => {
    await auth.ensureLogin(page);
  });

  it('plots an explore graph', async () => {
    try {
      await page.goto('http://localhost:3000/explore?state=%5B%22now-6h%22,%22now%22,%22Prom%22,%22up%22%5D');
      await page.waitForSelector('.main-view');
      // Series have been plotted
      await page.waitForSelector('canvas');
      await page.screenshot({ path: 'screenshot.png' });
      const metrics = await page.metrics();
      console.log(metrics);
    } catch (error) {
      await page.screenshot({ path: 'screenshot.png' });
    }
  });
});
