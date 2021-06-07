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

    describe('and using valid inputs,', async () => {
        beforeEach(async () => {
            //type valid input for title and content, then click submit
            await page.type('form input[name="title"]', 'My (test) Title!');
            await page.type('.content input', 'My (test) Content!');
            await page.click('form button');
        })

        test('submitting takes user to confirmation (review) page', async () => {
            await page.waitFor('h5');
            const formText = await page.getInnerHTML('h5');
            expect(formText).toEqual('Please confirm your entries');
        })

        test('submitting, then saving adds blog to end of index page', async () => {

        })

    })

    describe('and using invalid inputs (no input),', async () => {
        beforeEach(async () => {
            // form button === the Submit button
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