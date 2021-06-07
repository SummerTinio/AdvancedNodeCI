const ProxiedPage = require('../tests/helpers/ProxiedPage');

let page;

beforeEach(async () => {
    page = await ProxiedPage.build();
    await page.goto('localhost:3000');
});

afterEach(async () => {
    await page.close();
});

describe('When logged in', async () => {
    beforeEach(async () => {
        await page.login();
        await page.waitFor('a.btn-floating');
        await page.click('a.btn-floating');
    });

    it('displays blog creation form', async () => {
        const label = await page.getInnerHTML('form label')
    
        // assertion must be specific to this form -- so get a label that only exists in this form
        expect(label).toEqual('Blog Title');
    });

    describe('and using valid inputs,', async () => {
        beforeEach(async () => {
            //type valid input for title and content, then click submit
            await page.type('form input[name="title"]', 'My (test) Title!');
            await page.type('.content input', 'My (test) Content!');
            await page.click('form button');
        });

        test('submitting takes user to confirmation (review) page', async () => {
            await page.waitFor('h5');
            const formText = await page.getInnerHTML('h5');
            expect(formText).toEqual('Please confirm your entries');
        });

        test('submitting, then saving adds blog to end of index page', async () => {
            //click green "Next" button
            await page.click('button.green');

            // basically wait for any content not from the previous page.
            // NOTE: since every test creates a new user instance, the only blogpost on the site === the test Post
            await page.waitFor('.card');

            const blogTitle = await page.getInnerHTML('.card-title');
            const blogContent = await page.getInnerHTML('p');

            expect(blogTitle).toEqual('My (test) Title!');
            expect(blogContent).toEqual('My (test) Content!');
        });

    });

    describe('and using invalid inputs (no input),', async () => {
        beforeEach(async () => {
            // form button === the Submit button

            //click the Submit form button
            await page.waitFor('form button');
            await page.click('form button');
        });

        test('the form shows 2 error messages', async () => {
            //get form validation errors as DOM elements, and make assertion on them
            const blogTitleError = await page.getInnerHTML('.title .red-text');
            const contentError = await page.getInnerHTML('.content .red-text');
            expect(blogTitleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        });
    });
});

describe('When user is NOT logged in', async () => {
    test('the user cannot create blog posts', async () => {
        // to make a POST request from within puppeteer
        const postResult = await page.post('/api/blogs', { title: 'My Not-Logged-In (test) Title', content: 'My Not-Logged-In (test) Content'});

        // and make an assertion based on res object sent by that POST request
        expect(postResult).toEqual({ error: 'You must log in!' });
    });

    test('the user cannot GET list of blog posts', async () => {
        //to make a GET request to a protected resource from within puppeteer
        const getResult = await page.get('/api/blogs');

         // and make an assertion based on res object sent by that POST request
         expect(getResult).toEqual({ error: 'You must log in!' });
    })


});