const parse = require("csv-parse/lib/sync");
const stringify = require("csv-stringify/lib/sync")
const fs = require("fs");
const puppeteer = require("puppeteer");
const csv = fs.readFileSync(__dirname + "/data.csv");
const records = parse(csv.toString("utf-8"));
const axios = require("axios");

fs.readdir("screenshot", (err) => {
  if (err) {
    console.error("screenshot 폴더가 없어 생성");
    fs.mkdirSync("screenshot")
  }
});

fs.readdir("poster", (err) => {
  if (err) {
    console.error("poster 폴더가 없어 생성");
    fs.mkdirSync("poster")
  }
});

const crawler = async () => {
  try {
    const result = [];
    const browser = await puppeteer.launch({
      headless: process.env.NODE_ENV === "production",
      args: ["--window-size=1920,1080"]
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080,
    })
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36");
    for (const [i, row] of records.entries()) {
      const [title, url] = row;
      await page.goto(url);
      console.log(await page.evaluate("navigator.userAgent"))
      const result = await page.evaluate(() => {
        let result = {};
        const score = document.querySelector(".score .star_score");
        const poster = document.querySelector(".poster img");
        if (score) {
          result = Object.assign(result, {
            score: score.textContent.trim()
          })
        }
        if (poster) {
          result = Object.assign(result, {
            poster: poster.src
          })
        }
        return result;
      })
      if (result.score) {
        console.log("평점 ->", result.score.trim())
        result[i] = [title, url, result.score.trim()];
      }
      if (result.poster) {
        await page.screenshot({
          // 저장된 경로
          path: `screenshot/${title}.png`,
          // // 전체화면 여부
          // fullPage: true,
          // 특정 부분만 캡쳐
          clip: {
            x: 100,
            y: 100,
            width: 300,
            height: 300,
          }
        });
        // query string 제거
        // . -> 모든 단어
        // + -> 한개 이상
        // $ -> 끝
        const response = await axios.get(result.poster.replace(/\?.*$/, ""), {
          responseType: "arraybuffer"
        })
        fs.writeFileSync(`poster/${title}.jpg`, response.data)
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
