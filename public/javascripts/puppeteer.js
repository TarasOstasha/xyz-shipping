const logicData = async function (path) {
  const puppeteer = require('puppeteer');
  const fs = require('fs');
  
  (async () => {
    const browser = await puppeteer.launch();
    const pageUrls = ['https://example.com', 'https://google.com', 'https://facebook.com'];
  
    // Use Promise.all() to run each page in parallel
    const pageContents = await Promise.all(pageUrls.map(async (url) => {
      const page = await browser.newPage();
      await page.goto(url);
  
      // Use page.evaluate() to execute JavaScript code on the page
      const title = await page.evaluate(() => document.title);
      const body = await page.evaluate(() => document.body.innerHTML);
  
      await page.close();
  
      return { url, title, body };
    }));
  
    // Write the data to a text file
    const filename = 'page-data.txt';
    const fileContent = pageContents.map(page => `${page.url}\n${page.title}\n${page.body}\n\n`).join('');
    fs.writeFileSync(filename, fileContent);
  
    console.log(`Data saved to ${filename}`);
  
    await browser.close();
  })();
  
}




module.exports = { logicData }