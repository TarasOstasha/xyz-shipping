const  logicData = async function (path) {
    var express = require('express');
    const puppeteer = require('puppeteer');
    const fs = require("fs/promises");

    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(path);

    // Set screen size
    //await page.setViewport({width: 1080, height: 1024});
    // Wait and click on first result
    // click add to cart
    const addToCartSelector = '#btn_addtocart';
    await page.waitForSelector(addToCartSelector);
    await page.click(addToCartSelector);
    
    // wait for product in the cart
    await page.waitForTimeout(2000);
    // go to cart page
    const goToCartSelector = '.cart__link';
    await page.waitForSelector(goToCartSelector);
    await page.click(goToCartSelector);
    // fill out shiping fields
    const chooseStateOption = '#ShipState_dropdown';
    await page.waitForSelector(chooseStateOption);
    //await page.select(chooseStateOption, 'NJ');
    //await page.select('select[name="ShipState_dropdown"]', 'NJ');
    // await page.waitForSelector(2000);
    await page.waitForTimeout(2000);

    const data = await page.evaluate(() => {
      document.querySelector('select#ShipState_dropdown  option:nth-child(35)').selected = true; // select state
      document.querySelector('#v65-shipping-postcode').value = '07045'; // set up zip code
      document.querySelectorAll('input[name="ShipResidential"]')[1].click(); // choose bussiness address
      document.querySelector('#btnRecalculate').click(); // click get shipping rates
      //const shipping = document.querySelectorAll('select[name="ShippingSpeedChoice"]').value;//.map(item => console.log(item, 'shipping rates'));

    })
    await page.waitForTimeout(2000);
    let product = await page.$$eval('.v65-cart-details-cell > .carttext a', a => { 
      return a.map(item => item.href)
      // return a.map(item => {
      //   const str = item.href;
      //   const regex = /ProductCode=([a-zA-Z0-9]+)/;
      //   const match = str.match(regex);
      //   if (match) {
      //     const productCode = match[1];
      //     console.log(productCode); // Output: ws04920
      //     return productCode
      //   } else {
      //     console.log("Product code not found.");
      //   }
      // })
    
    })
    for (const link of product) {
        
        const regex = /ProductCode=([a-zA-Z0-9]+)/;
        const match = link.match(regex);
        if (match) {
          const productCode = match[1];
          console.log(productCode); // Output: ws04920
          await fs.appendFile("product.txt", productCode+'\n', (err) => {
            if(err) throw err;
            console.log('saced!')
        });
          //return productCode
        } else {
          console.log("Product code not found.");
        }
    }
    //method1
    // const shippingRates = await page.evaluate(() => {
    //   return Array.from(document.querySelectorAll('select[name="ShippingSpeedChoice"] > option')).map(item=>item.innerText);
    // })
    
    //method2
    const shippingRates = await page.$$eval('select[name="ShippingSpeedChoice"] > option', option => { return option.map(item => item.innerText) })
    let myData = { shippingRates };
    //await fs.writeFile("names.txt", shippingRates.join("\r\n"));

    fs.appendFile("names.txt", shippingRates.join("\r\n"), (err) => {
        if(err) throw err;
        console.log('saced!')
    })

    await browser.close();
}




module.exports = { logicData }