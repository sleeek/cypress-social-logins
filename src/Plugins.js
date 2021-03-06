'use strict'

const puppeteer = require('puppeteer')

/**
 *
 * @param {options.username} string username
 * @param {options.password} string password
 * @param {options.loginUrl} string loginURL
 * @param {potions.domain} string domain for Slack
 * @param {options.loginSelector} string a selector on the loginUrl page for the social provider button
 * @param {options.loginSelectorDelay} number delay a specific amount of time before clicking on the login button, defaults to 250ms. Pass a boolean false to avoid completely.
 * @param {options.postLoginSelector} string a selector on the app's post-login return page to assert that login is successful
 * @param {options.preLoginSelector} string a selector to find and click on before clicking on the login button (useful for accepting cookies)
 * @param {options.headless} boolean launch puppeteer in headless more or not
 * @param {options.logs} boolean whether to log cookies and other metadata to console
 * @param {options.getAllBrowserCookies} boolean whether to get all browser cookies instead of just for the loginUrl
 */

 /*
module.exports.GoogleSocialLogin = async function GoogleSocialLogin(options = {}) {
  validateOptions(options)

  const browser = await puppeteer.launch({headless: !!options.headless})
  const page = await browser.newPage()
  await page.setViewport({width: 1280, height: 800})

  await page.goto(options.loginUrl)

  await login({page, options})
  await typeUsername({page, options})
  await typePassword({page, options})

  const cookies = await getCookies({page, options})

  await finalizeSession({page, browser, options})

  return {
    cookies
  }
}
*/
module.exports.SlackSocialLogin = async function SlackSocialLogin(options={}){

  validateOptions(options)
  const browser = await puppeteer.launch({headless: !!options.headless})
  const page = await browser.newPage()
  await page.setViewport({width: 1280, height: 800})

  await page.goto(options.loginUrl)

  await login({page, options})
  await typeDomainforSlack({page, options})
  await typeIdPasswordforSlack({page, options})

  const cookies = await getCookies({page, options})

  await finalizeSession({page, browser, options})


  return {
    cookies
  }
}
function validateOptions(options) {
  if (!options.email || !options.password) {
    throw new Error('Email or Password missing for social login')
  }
}

async function login({page, options} = {}) {
  const delay = time => {
    return new Promise(function(resolve) {
      setTimeout(resolve, time)
    })
  }

  if (options.preLoginSelector) {
    await page.waitForSelector(options.preLoginSelector)
    await page.click(options.preLoginSelector)
  }

  await page.waitForSelector(options.loginSelector)

  if (options.loginSelectorDelay !== false) {
    await delay(options.loginSelectorDelay)
  }

  await page.click(options.loginSelector)
}
/*
async function typeUsername({page, options} = {}) {
  await page.waitForSelector('input[type="email"]')
  await page.type('input[type="email"]', options.username)
  await page.click('#identifierNext')
}

async function typePassword({page, options} = {}) {
  await page.waitForSelector('input[type="password"]', {visible: true})
  await page.type('input[type="password"]', options.password)
  await page.waitForSelector('#passwordNext', {visible: true})
  await page.click('#passwordNext')
}
*/

async function typeDomainforSlack({page, options} = {}) {
  await console.log("typeDomainforSlack >>")
  await page.waitForSelector('#domain', {visible: true})
  await page.evaluate((domain) => { (document.getElementById('domain')).value = domain; }, options.domain);
  await page.waitForSelector('#submit_team_domain', {visible: true})
  await page.screenshot({path:'001-typeDomainforSlack.png'})
  await page.click('#submit_team_domain')
  await console.log("<< typeDomainforSlack")
}
async function typeIdPasswordforSlack({page, options} = {}) {
  await console.log("typeIdPasswordforSlack >>")
  await page.waitForSelector('#email', {visible: true})
  await page.waitForSelector('#password', {visible: true})
  await page.evaluate((email) => { (document.getElementById('email')).value = email; }, options.email);
  await page.evaluate((password) => { (document.getElementById('password')).value = password; }, options.password);
  await console.log("Email: "+options.email)
  await console.log("Password: "+options.password)
  await page.waitForSelector('#signin_btn', {visible: true})
  await page.screenshot({path:'002-typeIdPasswordforSlack.png'})
  await page.click('#signin_btn')
  await page.waitForSelector('button[type="submit"]', {visible: true}) // button[data-qa="oauth_submit_button"]
  await page.screenshot({path:'003-typeIdPasswordforSlack.png'})
  await page.click('button[type="submit"]')
  await console.log("<< typeIdPasswordforSlack")
}



async function getCookies({page, options} = {}) {
  await page.screenshot({path:'004-getCookies.png'})
  await page.waitForSelector(options.postLoginSelector)

  const cookies = options.getAllBrowserCookies
    ? await getCookiesForAllDomains(page)
    : await page.cookies(options.loginUrl)

  if (options.logs) {
    console.log(cookies)
  }

  return cookies
}

async function getCookiesForAllDomains(page) {
  const cookies = await page._client.send('Network.getAllCookies', {})
  return cookies.cookies
}

async function finalizeSession({page, browser, options} = {}) {
  await browser.close()
}
