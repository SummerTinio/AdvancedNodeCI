const ProxiedPage = require('../tests/helpers/ProxiedPage');

let page;

beforeEach(async () => {
    page = await ProxiedPage.build();
    await page.goto('localhost:3000');
});

afterEach(async () => {
    await page.close();
})

it('displays blog creation form after logging in', async () => {
    //page.login() does NOT redirect to /blogs endpoint. -- leaves puppeteer at localhost:3000/
    await page.login();

})