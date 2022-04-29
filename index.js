require("dotenv").config();

const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: false });

  const context = await browser.newContext({
    baseURL: "https://moneyforward.com",
  });

  const page = await context.newPage();
  await page.goto("/");

  await page.click('a[href="/sign_in"]');
  await page
    .locator(':nth-match(:text("メールアドレスでログイン"), 1)')
    .click();

  await page.fill('input[type="email"]', process.env.EMAIL);
  await page.click('input[type="submit"]');

  await page.fill('input[type="password"]', process.env.PASSWORD);
  await page.click('input[type="submit"]');

  await page.goto("/accounts");

  const buttonSelector =
    'input:not(disabled)[type="submit"][name="commit"][value="更新"]';
  const buttonCount = await page.$$eval(
    buttonSelector,
    (buttons) => buttons.length
  );

  let i = 1;
  let clickedCount = 0;
  while (clickedCount < buttonCount) {
    const trSelector = `section#registration-table.accounts table#account-table tr:nth-child(${i})`;
    if (await page.$$eval(`${trSelector} ${buttonSelector}`, (l) => l.length)) {
      let account = await page.evaluate((sel) => {
        let element = document.querySelector(sel);
        if (element) {
          return element.textContent
            .replace(/\([\s\S]*/, "")
            .replace(/[\n\r]*/g, "");
        }
      }, `${trSelector} td:first-child`);

      console.info(account);

      await page.click(`${trSelector} ${buttonSelector}`);
      clickedCount++;
    }
    i++;
  }
  await browser.close();
})();
