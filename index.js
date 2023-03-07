const moment = require('moment');
const puppeteer = require('puppeteer');
const data = require('./data.json');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`file://${__dirname}/index.html`);
  await page.evaluate((data) => {
    Object.keys(data).forEach((key) => {
      document.querySelectorAll(`.${key}`).forEach((el, i) => {
        if (typeof data[key] === 'object') {
          el.innerHTML = Object.values(data[key])[i % 2];
          return;
        }
        el.innerHTML = data[key];
      });
    });
    document.querySelectorAll('.invoice-number').forEach((el) => {
      el.innerHTML = moment().format('MM-YY');
    });
    document.querySelectorAll('.date').forEach((el) => {
      el.innerHTML = moment().format('DD.MM.YYYY');
    });
    document.querySelectorAll('.period').forEach((el) => {
      el.innerHTML = moment().startOf('M').format('DD.MM.YYYY') + ' - ' + moment().endOf('M').format('DD.MM.YYYY');
    });
  }, data);
  if (!fs.existsSync('invoices')) fs.mkdirSync('invoices');
  await page.pdf({
    path: `invoices/Invoice ${moment().format('MM-YY')}.pdf`,
    format: 'A4',
    margin: {
      top: "20px",
      left: "20px",
      right: "20px",
      bottom: "20px"
    }
  });
  await browser.close();
})();