const parse = require("csv-parse/lib/sync");
const stringify = require("csv-stringify/lib/sync")
const fs = require("fs");
const puppeteer = require("puppeteer");
const csv = fs.readFileSync(__dirname + "/data.csv");
const records = parse(csv.toString("utf-8"));

const crawler = async () => {
  try {
    const result = [];
    const browser = await puppeteer.launch({ headless: process.env.NODE_ENV === "production" });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36");
    for (const [i, row] of records.entries()) {
      const [title, url] = row;
      await page.goto(url);
      console.log(await page.evaluate("navigator.userAgent"))
      const text = await page.evaluate(() => {
        const score = document.querySelector(".score .star_score");
        if (score) {
          return score.textContent.trim();
        }
      })
      if (text) {
        result[i] = [title, url, text];
      }
      await page.waitForTimeout(1000);
    }
    await page.close();
    await browser.close();
    console.log(result);
    const string = stringify(result);
    fs.writeFileSync(__dirname + "/result.csv", string)
  } catch (e) {
    console.log(e);
  }
}

crawler();
