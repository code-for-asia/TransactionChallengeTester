let FILE_PATH = " http://localhost:3000";

const {Builder, Key, By, until} = require("selenium-webdriver");

const { Options: ChromeOptions } = require('selenium-webdriver/chrome');
const webdriver = require('selenium-webdriver');
var points = 0;
var errorLog = [];
const MAX_PONTS = 5;


// to remove log cluttering
const chromeOptions = new ChromeOptions();
chromeOptions.excludeSwitches('enable-logging');

// open html
let driver = new webdriver.Builder()
    .forBrowser("chrome")
    .setChromeOptions(chromeOptions)
    .build();


driver.get(FILE_PATH)


async function testIncome(){

    // adding first income
    let titleBox = await driver.findElement(By.id("titleInput"));
    await titleBox.sendKeys("Salary1");

    let amountBox = await driver.findElement(By.id("amountInput"));
    await amountBox.sendKeys(300);

    let incomeBtn = await driver.findElement(By.id("income"));
    await incomeBtn.click();

    let addBtn = await driver.findElement(By.id("addButton"));
    await addBtn.click();


    // adding second income
    titleBox = await driver.findElement(By.id("titleInput"));
    await titleBox.sendKeys("Salary2");

    amountBox = await driver.findElement(By.id("amountInput"));
    await amountBox.sendKeys(100);

    incomeBtn = await driver.findElement(By.id("income"));
    await incomeBtn.click();

    addBtn = await driver.findElement(By.id("addButton"));
    await addBtn.click();


    // testing whether total was added properly
    incomeDisplay = await driver.findElement(By.id("incomeDisplay")).getText();
    if (incomeDisplay == "$ 400.00"){
        points += 1;
    }
    else{
        errorLog.push("Income total incorrect")
    }

}


async function testExpence(){

    // adding first expence
    let titleBox = await driver.findElement(By.id("titleInput"));
    await titleBox.sendKeys("Bill1");

    let amountBox = await driver.findElement(By.id("amountInput"));
    await amountBox.sendKeys(100);

    let expenceBtn = await driver.findElement(By.id("expence"));
    await expenceBtn.click();

    let addBtn = await driver.findElement(By.id("addButton"));
    await addBtn.click();


    // adding second expence
    titleBox = await driver.findElement(By.id("titleInput"));
    await titleBox.sendKeys("Bill2");

    amountBox = await driver.findElement(By.id("amountInput"));
    await amountBox.sendKeys(100);

    expenceBtn = await driver.findElement(By.id("expence"));
    await expenceBtn.click();

    await addBtn.click();


    // testing whether total was added properly
    expenceDisplay = await driver.findElement(By.id("expenceDisplay")).getText();
    if (expenceDisplay == "$ 200.00"){
        points += 1;
    }
    else{
        errorLog.push("Expence total incorrect")
    }

    // testing if insufficient balance message is given
    titleBox = await driver.findElement(By.id("titleInput"));
    await titleBox.sendKeys("Bill3");

    amountBox = await driver.findElement(By.id("amountInput"));
    await amountBox.sendKeys(1000);

    await addBtn.click();

    try{
        await driver.wait(until.alertIsPresent());
        let alert = await driver.switchTo().alert();
        await alert.accept();
        points += 1;
    }
    catch{
        errorLog.push("Insufficient balance alert not displayed")
    }
    


    
}

async function testBalance(){

    let balanceDisplay = await driver.findElement(By.id("balanceDisplay")).getText();
    if (balanceDisplay == "$ 200.00"){
        points += 1;
    }
    else{
        errorLog.push("Balance total incorrect")
    }


    
}

async function testHistory(){

    let historyRoot = await driver.findElement(By.id('historyList'));
    let historyList = await historyRoot.findElements(By.className('transaction-box'));

    // console.log(historyList.length)
    // for (let i = 0; i < historyList.length; i ++){
    //     console.log(await historyList[i].getText())
    // }

    let test1 = false
    let test2 = false
    let test3 = false
    let test4 = false
    
    if ((await historyList[0].getText()).includes('Bill2') && (await historyList[0].getText()).includes('$ 100.00')){
        test1 = true
    }

    if ((await historyList[1].getText()).includes('Bill1') && (await historyList[1].getText()).includes('$ 100.00')){
        test2 = true
    }

    if ((await historyList[2].getText()).includes('Salary2') && (await historyList[2].getText()).includes('$ 100.00')){
        test3 = true
    }

    if ((await historyList[3].getText()).includes('Salary1') && (await historyList[3].getText()).includes('$ 300.00')){
        test4 = true
    }

    if (test1 && test2 && test3 && test4){
        points += 1
    }
    else{
        errorLog.push("The ordering or an amount in the transaction list is incorrect")
    }

    
}




async function main(){
    await testIncome();
    await testExpence();
    await testBalance();
    await testHistory();

    driver.close()

    
    console.log("FINAL POINTS: " + points + "/" + MAX_PONTS)

    if (points != MAX_PONTS){
        for (let i = 0; i < errorLog.length; i++){
            console.log(errorLog[i])
        }
    }
}

main();



