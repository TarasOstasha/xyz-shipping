var express = require('express');
const puppeteer = require('puppeteer');
var router = express.Router();
const fs = require("fs/promises");

const productDependencies = require('../public/javascripts/products.js');
const startPuppeteer = require('../public/javascripts/puppeteer');




/* GET home page. */
router.get('/', async function (req, res, next) {

  res.render('index', { title: 'XYZ Display Shipping' });
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: {
        width: 1920,
        height: 1080
      }
    });

    let productList = productDependencies.products;
    for (let i = 0; i < productList.length; i++) {
      console.log(productList[i]);
      const page = await browser.newPage();
      await page.goto(
        `https://www.xyzdisplays.com/20ft-x10ft-Straight-RPL-Fabric-Display-With-Endcap-p/${productList[i]}.htm`
      );
      //await page.goto('https://www.xyzdisplays.com/20ft-x10ft-Straight-RPL-Fabric-Display-With-Endcap-p/ws04920.htm');
      if (i == 0) {
        // Set screen size
        //await page.setViewport({width: 1080, height: 1024});
        // Wait and click on first result
        // click add to cart
        const addToCartSelector = "#btn_addtocart";
        await page.waitForSelector(addToCartSelector);
        await page.click(addToCartSelector);

        // wait for product in the cart
        await page.waitForTimeout(2000);
        // go to cart page
        const goToCartSelector = ".cart__link";
        await page.waitForSelector(goToCartSelector);
        await page.click(goToCartSelector);
        // fill out shiping fields
        const chooseStateOption = "#ShipState_dropdown";
        await page.waitForSelector(chooseStateOption);
        //await page.select(chooseStateOption, 'NJ');
        //await page.select('select[name="ShipState_dropdown"]', 'NJ');
        // await page.waitForSelector(2000);
        await page.waitForTimeout(2000);

        // IF 2 ITERATION SKIP THIS STEP
        const data = await page.evaluate(() => {
          document.querySelector(
            "select#ShipState_dropdown  option:nth-child(35)"
          ).selected = true; // select state
          document.querySelector("#v65-shipping-postcode").value = "07045"; // set up zip code
          document.querySelectorAll('input[name="ShipResidential"]')[1].click(); // choose bussiness address
          document.querySelector("#btnRecalculate").click(); // click get shipping rates
          //const shipping = document.querySelectorAll('select[name="ShippingSpeedChoice"]').value;//.map(item => console.log(item, 'shipping rates'));
        });

        await page.waitForTimeout(2000);
        const product = await page.$$eval(
          ".v65-cart-details-cell > .carttext a",
          (a) => {
            return a.map((item) => {
              const str = item.href;
              const regex = /ProductCode=([a-zA-Z0-9]+)/;
              const match = str.match(regex);
              if (match) {
                const productCode = match[1];
                //console.log(productCode); // Output: ws04920
                return productCode;
              } else {
                console.log("Product code not found.");
              }
            });
          }
        );
        //method2
        const shippingRates = await page.$$eval(
          'select[name="ShippingSpeedChoice"] > option',
          (option) => {
            return option.map((item) => item.innerText);
          }
        );
   
        console.log(shippingRates, product);
        await fs.writeFile("shipping.txt", `${product}-${shippingRates}\n`);

        //await fs.writeFile("test.txt", shipping)
        // remove from cart
        await page.reload();
        await page.waitForTimeout(2000);
        const removeFromCartSelector = ".v65-cart-item-remove-link";
        await page.waitForSelector(removeFromCartSelector);
        await page.click(removeFromCartSelector);
        await page.waitForTimeout(2000);
        await page.close();
      }
      if (i > 0) {
        // Set screen size
        //await page.setViewport({width: 1080, height: 1024});
        // Wait and click on first result
        // click add to cart
        const addToCartSelector = "#btn_addtocart";
        await page.waitForSelector(addToCartSelector);
        await page.waitForTimeout(2000);
        await page.click(addToCartSelector);

        // wait for product in the cart
        await page.waitForTimeout(2000);
        // go to cart page
        const goToCartSelector = ".cart__link";
        await page.waitForSelector(goToCartSelector);
        await page.waitForTimeout(2000);
        await page.click(goToCartSelector);
        // fill out shiping fields
        //const chooseStateOption = "#ShipState_dropdown";
        //await page.waitForSelector(chooseStateOption);
        //await page.select(chooseStateOption, 'NJ');
        //await page.select('select[name="ShipState_dropdown"]', 'NJ');
        // await page.waitForSelector(2000);
        //await page.waitForTimeout(2000);

        await page.waitForTimeout(2000);

        const product = await page.$$eval(
          ".v65-cart-details-cell > .carttext a",
          (a) => {
            return a.map((item) => {
              const str = item.href;
              const regex = /ProductCode=([a-zA-Z0-9]+)/;
              const match = str.match(regex);
              if (match) {
                const productCode = match[1];
                //console.log(productCode); // Output: ws04920
                return productCode;
              } else {
                console.log("Product code not found.");
              }
            });
          }
        );

        // get shipping prices
        const shippingRates = await page.$$eval(
          'select[name="ShippingSpeedChoice"] > option',
          (option) => {
            return option.map((item) => item.innerText);
          }
        );

        console.log(shippingRates, product);
        await fs.appendFile("shipping.txt", `${product}-${shippingRates}\n`);
        //await fs.writeFile("names.txt", `${product}-${shippingRates}`);

        //await fs.writeFile("test.txt", shipping)

        // remove from cart
        await page.reload();
        await page.waitForTimeout(2000);
        const elementExists = (await page.$(".v65-cart-item-remove-link")) !== null;
        if (elementExists) {
          const removeFromCartSelector = ".v65-cart-item-remove-link";
          await page.waitForSelector(removeFromCartSelector);
          await page.click(removeFromCartSelector);
          await page.waitForTimeout(2000);
          await page.close();
        } else {
          await page.close();
        }
      }
    }

    await browser.close();
  } catch (error) {
    console.log(error, "error");
  }
});

module.exports = router;

// explanation - https://www.youtube.com/watch?v=lgyszZhAZOI
