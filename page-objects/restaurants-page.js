const { expect } = require('@playwright/test');
const { RESTAURANTS_CATEGORIES } = require('../constants/restaurants-categories');

exports.RestaurantsPage = class RestaurantsPage {

    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        //create a class variable and assign it to page argument passed to the constructor
        this.page = page;

        //landing page locators
        this.header = page.getByText('Time to order food');
        this.subHeader = page.getByText('Find restaurants in your area');
        this.addressSearchBox = page.locator('[data-qa="location-panel-search-input-address-element"]');
        this.addressOption = page.locator('li[data-qa="location-panel-results-item-element"]',
            { hasText: 'Mühlenstraße 25A, 13187 Berlin' });

        //restaurants page locators
        this.cuisineFilter = page.locator('[data-qa="cuisine-filter"]');
        this.minOrderValueRadioBtn = page.locator('[data-qa="radio"]').nth(1);
        this.resultCounter = page.locator('[data-qa="sidebar-result-counter"]');
        this.resetBtn = page.locator('[data-qa="sidebar-reset"]');
        this.openNowCheckBox = page.locator('[data-qa="availability-filter-switch"]');
        this.restaurantCardMinOrderTxt = page.locator('[data-qa="mov-indicator-content"] [data-qa="text"]');
        this.showCategoriesBtn = page.getByRole('button', { name: 'Show more' });
        this.categorySearchBox = page.locator('[data-qa="cuisine-search"] input');
        this.categoryBill = page.locator('[data-qa="cuisine-filter-modal"] [data-qa="cuisine-filter-modal-item"] > div > div');
        this.restaurantCards = page.locator('[data-qa="restaurant-card-element"]');
        this.nextRoute = page.locator('iframe[src*="italian-food"]');
        this.menuPizza = page.getByText('Pizza');
        this.menuPasta = page.getByText('Pasta');
        //TODO add proper selector for back btn
        this.backToRestaurantsListBtn = page.locator('');
    }

    /**
     * Action Methods
     */
    async goto() {
        await this.page.goto('https://www.lieferando.de/en/');
    }

    async searchAddress(address) {
        await this.addressSearchBox.fill(address);
        await this.addressOption.click();
        await expect(this.cuisineFilter).toBeVisible();
    }

    async filterByMinimumOrderValue() {
        // Select '10,00 € or less' radio button
        await this.minOrderValueRadioBtn.click();
    }

    async filterByOpenNow() {
        // Check 'Open Now' checkbox
        await this.openNowCheckBox.click();
    }

    async filterByItalianCategory() {
        await this.filterByCategory(RESTAURANTS_CATEGORIES.ITALIAN);
        await expect(this.page).toHaveURL(/.*italian-food/);
    }

    async filterByCategory(category) {
        await this.showCategoriesBtn.click();
        await expect(this.page).toHaveURL(/.*cuisine/);
        await this.categorySearchBox.fill(category);
        await this.page.waitForSelector('[data-qa="cuisine-filter-modal"] [data-qa="cuisine-filter-modal-item"] > div > div');
        await this.categoryBill.nth(0).waitFor();
        await this.categoryBill.nth(0).click();
        await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes('/v1/track?eventKey=cuisineFilterSelected') && resp.status() === 200)
        ]);
    }

    /**
     * Helper Methods
     */
    async getResultCounter(){
        return Number((await this.resultCounter.innerText()).replace(/[^0-9]/g, ''));
    }

    async showAllResults(){
        await this.page.evaluate(async () => {
            const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
            for (let i = 0; i < document.body.scrollHeight; i += 100) {
                window.scrollTo(0, i);
                await delay(100);
            }
        });
    }

    async verifyRandomResultOfMinOrder() {
        await this.verifyResultsCount();
        //Iterate through the restaurants cards and verify the min order value
        for (const card of await this.restaurantCardMinOrderTxt.all()){
            let minOrderValue = Number((await card.innerText()).replace(/[^0-9\.-]+/g, "")/100);
            await expect(minOrderValue).toBeLessThanOrEqual(10);
        }
        /**
         * Pick random card and verify the min order value - timely wise verification
         */
        /**
         * let randomIndex = Math.floor((Math.random() * await this.restaurantCards.count()) + 1);
         * let minOrderValue = Number((await this.restaurantCardMinOrderTxt.nth(randomIndex).innerText()).replace(/[^0-9\.-]+/g, "")/100);
         * await expect(minOrderValue).toBeLessThanOrEqual(10);
         */
    }

    async verifyItalianRestaurants() {
        await this.verifyResultsCount();
        /**
         * Pick random card and verify the menu has pizza and pasta
         * TODO ask dev team to add common attribute for restaurant category to be used in automation
         * otherwise this scenario wouldn't be suitable for e2e automation testing
         */

        let randomIndex = Math.floor((Math.random() * await this.restaurantCards.count()) + 1);
        await this.restaurantCardMinOrderTxt.nth(randomIndex).waitFor();
        await this.restaurantCardMinOrderTxt.nth(randomIndex).click();
        await expect(await this.menuPizza.first()).toBeVisible();
        await expect(await this.menuPasta.first()).toBeVisible();
    }

    async verifyResultsCount() {
        //Expect actual returned cards count equal to the number displayed in the result counter
        await expect(await this.restaurantCards.count()).toEqual(await this.getResultCounter());
    }
}