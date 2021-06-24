const fs = require("fs");
const puppeteer = require("puppeteer");
const axios = require("axios");

const crawler = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false
    })
    const page = await browser.newPage();
    await page.goto("https://unsplash.com");
    const result = await page.evaluate(() => {
      const images = []
      const imageContainer = document.querySelectorAll("._6IG7");
      if (imageContainer.length) {
        imageContainer.forEach((container) => {
          const image = container.querySelector("img._2UpQX").src;
          image && images.push(image);
          container.parentElement.removeChild(container);
        });
        window.scrollBy(0, 300); // 마우스 스크롤
        return images
      }
    });
    await page.waitForSelector("._6IG7");
    console.log("로딩 완료!")
    console.log(result);
  } catch (e) {
    console.log(e);
  }
}

crawler();
