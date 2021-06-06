const puppeteer = require('puppeteer');

let browser, page;

beforeEach(async () => {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage(); 
    await page.goto('localhost:3000');
})

afterEach(async () => {
    await browser.close();
})

it('renders header with `Blogster`', async () => {
    const text = await page.$eval('a.brand-logo', el => el.innerHTML);
    expect(text).toEqual('Blogster');
})

it('starts OAuth flow after being clicked', async () => {
    await page.click('.right a');
    const url = await page.url();
    expect(url).toMatch(/accounts\.google\.com/);
})

it('shows logout button when signed in', async () => {
    // MongoDB id for particular user -- req.user.id
    const id = '60ba77090c0eb6521cfb07bc'; 
    
    const Buffer = require('safe-buffer').Buffer;
    // fake sessionObject -- looks like a utf-8 parsed session=longWeirdString
    const sessionObject = {
        passport: {
            user: id
        }
    };
    //stringifying that sessionObject and translating it into base64 via toString
    const sessionString = Buffer.from(
        JSON.stringify(sessionObject))
        .toString('base64');

    //provide keygrip cookieSigningSecret and sessionString .. to get session.sig
    const Keygrip = require('keygrip');
    const keys = require('../config/keys');
    const keygrip = new Keygrip([keys.cookieKey]);
    const sig = keygrip.sign(`session=${sessionString}`); //note: tested sessionString and sig = correct!

    await page.setCookie({ name: 'session', value: sessionString });
    await page.setCookie({ name: 'session.sig', value: sig });
    await page.goto('localhost:3000');
 
    // gotta .waitFor that anchor tag to  be rendered before asserting!
    await page.waitFor('a[href="/auth/logout"]');

    // get a DOM node, assert
    const text = await page.$eval('.right a[href="/auth/logout"]', el => el.innerHTML);
    expect(text).toEqual('Logout');
})