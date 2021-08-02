const fs = require("fs");
const puppeteer = require("puppeteer");
const axios = require("axios");

fs.readdir("images", (err) => {
  if (err) {
    fs.mkdirSync("images")
  }
})

function removeQueryString (link) {
  return link.replace(/\?.*$/, "");
}
const crawler = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false
    })
    const page = await browser.newPage();
    await page.goto("https://unsplash.com");
    let result = [];
    while (result.length <= 30) {
      const imageLinks = await page.evaluate(() => {
        const images = []
        const imageContainer = document.querySelectorAll("._6IG7");
        if (imageContainer.length) {
          imageContainer.forEach((container) => {
            const image = container.querySelector("img.oCCRx").src;
            image && images.push(image);
            container.parentElement.removeChild(container);
          });
          window.scrollBy(0, 300); // 마우스 스크롤
          return images
        }
      });
      result = result.concat(imageLinks);
      await page.waitForSelector("._6IG7");
      console.log("로딩 완료!")
    }
    result.forEach(async (link) => {
      console.log(removeQueryString(link));
      const image = await axios.get(removeQueryString(link), {
        responseType: "arraybuffer"
      })
      await fs.writeFileSync(`images/${new Date().getTime()}.jpeg`, image.data)
    })
    console.log("완료")
    await page.close()
    await browser.close()
  } catch (e) {
    console.log(e);
  }
}

crawler();
