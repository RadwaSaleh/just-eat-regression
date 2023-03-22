const { test, expect} = require('@playwright/test');
const { RestaurantsPage } = require('../page-objects/restaurants-page');

test.describe('Filtering restaurants list', async () => {
    let page;
    let restaurantsPage;
    const address = 'Mühlenstraße 25A, 13187 Berlin';

    test.beforeEach(async ({ browser }, testInfo) => {
        const context = await browser.newContext();
        await context.grantPermissions(['geolocation'], { origin: 'https://www.lieferando.de/en/' });
        page = await context.newPage();
        restaurantsPage = new RestaurantsPage(page);
        console.log(`Running ${testInfo.title}`);
        await restaurantsPage.goto();
        await expect(restaurantsPage.header).toBeVisible();
        await expect(restaurantsPage.subHeader).toBeVisible();
        await restaurantsPage.searchAddress(address);
    });

    test('filter by minimum order of 10,00 € or less', async () => {
        await restaurantsPage.filterByMinimumOrderValue();
        await restaurantsPage.filterByOpenNow(); //Exclude closed restaurants as they don't show min order info on restaurant card
        await restaurantsPage.showAllResults();
        await restaurantsPage.verifyRandomResultOfMinOrder();
    });

    test('filter by Italian Cuisine', async () => {
        await restaurantsPage.filterByItalianCategory();
        await restaurantsPage.filterByOpenNow();
        await restaurantsPage.showAllResults();
        await restaurantsPage.verifyItalianRestaurants();
    });
})

