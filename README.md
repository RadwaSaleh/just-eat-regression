# Playwright E2E Testing

This repo is meant to showcase e2e tests for Lieferando app (https://www.lieferando.de/en/) using Playwright Test.
- Page Object Model design pattern is used, it increases readability of code and is much easier to manage.


## Setup
1- Open terminal and change the current working directory to the location where you want the cloned directory.

2- Clone this repo by running the following command.
`git clone git@github.com:RadwaSaleh/just-eat-regression.git`

3- Install yarn 

## Run Tests
- Run all tests non-interactively.
  `yarn test`

- Run all tests interactively.
  `yarn headful-test`

- Run a single test file
- `yarn test restaurants-filtering.spec.js`

- Test and generate HTML report
  `yarn test-and-report`

#### HTML Report Example:
![html-report-example.png](resources%2Fhtml-report-example.png)