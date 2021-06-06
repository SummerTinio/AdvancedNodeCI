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
            headless: false
        });

        const page = await browser.newPage();
        const customPage = new CustomPage(page)
    
        // tells Proxy to look for property on customPage --> page --> browser in that order
        return new Proxy(customPage, {
            get: function(target, property) {
                // change order of these fxns in order of priority
                return customPage[property] || browser[property] || page[property];
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
        await this.page.goto('localhost:3000');
    
        // gotta .waitFor that anchor tag to  be rendered before asserting!
        await this.page.waitFor('a[href="/auth/logout"]');
    }
}

// wraps up everything we need for Puppeteer -- so no need to import puppeteer henceforth
module.exports = ProxiedPage;