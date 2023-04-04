const { test, expect} = require('@playwright/test');
const { RestaurantsPage } = require('../page-objects/restaurants-page');

// playwright-extra is a drop-in replacement for playwright,
// it augments the installed playwright with plugin functionality
const { chromium } = require("playwright-extra");

// Load the stealth plugin and use defaults (all tricks to hide playwright usage)
// Note: playwright-extra is compatible with most puppeteer-extra plugins
const stealth = require("puppeteer-extra-plugin-stealth")();

chromium.use(stealth);

test.describe('Filtering restaurants list', async () => {
    let page;
    let restaurantsPage;
    const address = 'Mühlenstraße 25A, 13187 Berlin';

    test.beforeEach(async ( testInfo) => {
        const browser = await chromium.launch();
        const context = await browser.newContext();
        await context.grantPermissions(['geolocation'], { origin: 'https://www.lieferando.de/en/' });
        page = await context.newPage();
        restaurantsPage = new RestaurantsPage(page);
        // console.log(`Running ${testInfo.title}`);
        await restaurantsPage.goto();
        await expect(restaurantsPage.header).toBeVisible();
        await expect(restaurantsPage.subHeader).toBeVisible();
        await restaurantsPage.searchAddress(address);
    });

    test('filter by minimum order of 10,00 € or less', async () => {
        await restaurantsPage.filterByMinimumOrderValue();
        //Exclude closed restaurants as they don't show min order info on restaurant card
        await restaurantsPage.filterByOpenNow();
        await restaurantsPage.showAllResults();
        await restaurantsPage.verifyRandomResultOfMinOrder();
    });

    test('filter by Italian Cuisine', async () => {
        await restaurantsPage.filterByItalianCategory();
        await restaurantsPage.filterByOpenNow();
        if(await restaurantsPage.noResultsMsg.isVisible()){
            console.log('No Results Found...')
        }
        else{
            await restaurantsPage.showAllResults();
            await restaurantsPage.verifyItalianRestaurants();
        }
    });
})
