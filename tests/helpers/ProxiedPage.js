const puppeteer = require('puppeteer');

const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

// Static methods === accessible from ProxiedPage.staticMethod()
// class instance methods === accessible from proxiedPageInstance.instanceMethod()
class ProxiedPage {
    // calling CustomPage.build()
    //launches a virtual browser, opens a tab on it,
    // and returns a Proxy object -- from w/c u can directly access methods on
    // customPage, page, & browser, ALL FROM THE SAME PLACE
    static async build() { // <-- creates method: CustomPage.build()
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox'] // so we don't need to mess around with travis's VM settings
        })

        const page = await browser.newPage();
        const proxiedPage = new ProxiedPage(page)

        // tells Proxy to look for property on customPage --> page --> browser in that order
        return new Proxy(proxiedPage, {
            get: function (target, property) {
                // change order of these fxns in order of priority
                return proxiedPage[property] || browser[property] || page[property];
            }
        })
    }

    constructor(page) {
        this.page = page;
    }

    // instance method -- accessible via proxiedPageInstance.login()
    async login() {
        // creates new user instance from MongoDB
        const user = await userFactory();

        // session = sessionString
        const { session, sig } = sessionFactory(user);

        // creates a new Ssession
        await this.page.setCookie({ name: 'session', value: session });
        await this.page.setCookie({ name: 'session.sig', value: sig });
        //await this.page.goto('localhost:3000');

        //remove this line if you want to reuse this ProxiedPage elsewhere
        await this.page.goto('http://localhost:3000/blogs');

        // gotta .waitFor that anchor tag to  be rendered before asserting!
        await this.page.waitFor('a[href="/auth/logout"]');
    }

    //wrapper for page.$eval() call --> proxiedPageInstance.getInnerHTML(selector)
    async getInnerHTML(selector) {
        return this.page.$eval(selector, el => el.innerHTML);
    }

    //wrapper for page.evaluate() call --> automate a GET test request
    post(apiEndPoint, reqBody) {//reqBody === some req body w/ form { title: '', content: ''}
        //must return fxn, so Jest knows we're supposed to await a result from this fxn call
        //also must set 'this' to refer to an instance of ProxiedPage
        return this.page.evaluate(
            //note: the entire callback below gets stringified AS IS
            //reference to apiEndpoint will NOT be evaluated as normal JS
            (_apiEndPoint, _reqBody) => {
                return fetch(_apiEndPoint, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(_reqBody)
                    // fetch returns a promise, so .then() to capture the resolved value
                }).then(res => res.json());
                // to allow apiEndpoint to get evaluated BEFORE callback is stringified
            }, apiEndPoint, reqBody
        );
    }

    //wrapper for page.evaluate() call --> automate a POST test request
    get(apiEndPoint) {
        return this.page.evaluate(
            //_apiEndpoint is totally different variable from apiEndpoint, just with the same value
            (_apiEndPoint) => {
                return fetch(_apiEndPoint, {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    } //note: GET request can NOT have a body
                    // fetch returns a promise, so .then() to capture the resolved value
                }).then(res => res.json());
                // arg to pass into page.evaluate() callback
            }, apiEndPoint
        );
    }

    //expects array of objects in form of: 
    //[ { method: 'get', apiEndPoint: '/api/blogs', expectedResult: { error: 'You must log in!' } }, { method: 'post', apiEndPoint: '/api/blogs', reqBody: { title: 'T', content: 'C' }, expectedResult: { error: 'You must log in!' } }]
    execRequests(actionsArr) {
        //since each iteration returns a promise
        return Promise.all(actionsArr.map(({ method, apiEndPoint, reqBody }) => {
            //reference to this.get() or this.post()
            //Computed Member Access Notation, where [method] is computed
            return this[method](apiEndPoint, reqBody)
        }));
    }

}

// wraps up everything we need for Puppeteer -- so no need to import puppeteer henceforth
module.exports = ProxiedPage;
