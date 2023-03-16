const { expect } = require('@playwright/test');

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
        this.restaurantCards = page.locator('[data-qa="mov-indicator-content"] [data-qa="text"]');
    }

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
        //Expect actual returned cards count equal to the number displayed in the result counter
        await expect(await this.restaurantCards.count()).toEqual(await this.getResultCounter());
        //Pick random card and verify the min order value
        let randomIndex = Math.floor((Math.random() * await this.restaurantCards.count()) + 1);
        let minOrderValue = Number((await this.restaurantCards.nth(randomIndex).innerText()).replace(/[^0-9\.-]+/g, "")/100);
        await expect(minOrderValue).toBeLessThanOrEqual(10);
    }
}