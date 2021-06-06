const sessionFactory = require('./factories/sessionFactory');
const userFactory = require('./factories/userFactory');

// wraps up everything we need from Puppeteer -- so no need for puppeteer anymore
// namely, .launch, .newPage, .close
const ProxiedPage = require('./helpers/ProxiedPage');

let page;

beforeEach(async () => {
    page = await ProxiedPage.build();
    await page.goto('localhost:3000');
})

afterEach(async () => {
    page.close();
})

it('renders header with `Blogster`', async () => {
    // .waitFor that specific DOM element to be rendered completely before asserting
    await page.waitFor('a.brand-logo');
    const text = await page.$eval('a.brand-logo', el => el.innerHTML);
    expect(text).toEqual('Blogster');
})

it('starts OAuth flow after being clicked', async () => {
    await page.click('.right a');
    const url = await page.url();
    expect(url).toMatch(/accounts\.google\.com/);
})

it('shows logout button when signed in', async () => {
    // login using fake session and session.sig
    await page.login();
    // get a DOM node, assert
    const text = await page.$eval('.right a[href="/auth/logout"]', el => el.innerHTML);
    expect(text).toEqual('Logout');
})