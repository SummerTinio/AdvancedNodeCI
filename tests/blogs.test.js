const ProxiedPage = require('../tests/helpers/ProxiedPage');

let page;

beforeEach(async () => {
    page = await ProxiedPage.build();
    await page.goto('localhost:3000');
});

afterEach(async () => {
    await page.close();
})

describe('When logged in,', async () => {
    beforeEach(async () => {
        await page.login();
        await page.waitFor('a.btn-floating');
        await page.click('a.btn-floating');
    })

    it('displays blog creation form', async () => {
        const label = await page.getInnerHTML('form label')
    
        // assertion must be specific to this form -- so get a label that only exists in this form
        expect(label).toEqual('Blog Title');
    })

    describe('and using invalid inputs (no input),', async () => {
        beforeEach(async () => {
            await page.waitFor('form button');
            await page.click('form button');
        })

        test('the form shows 2 error messages', async () => {
            const blogTitleError = await page.getInnerHTML('.title .red-text');
            const contentError = await page.getInnerHTML('.content .red-text');
            expect(blogTitleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        })
    })
})