const express = require('express');
const app = express();
var PORT = 8000;

app.set('view engine', 'ejs')

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true} ))


app.post("/", (req, res) => {
    // cleaning variables each time POST request is recieved
    globalString = "";
    results = [];
    transactionArray = [];
    balance = 0;
    
    try{
        tester(req.body.filePath, function() {
            res.send(globalString)
        })
    }
    catch{
        res.send("There was a problem with the selected file. Please try again.")
    }
    
})

app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on http://localhost:" + PORT);
});


var globalString;
var results;
var transactionArray;
var balance;


async function tester(fp, callback){
    let FILE_PATH = fp;

    const {Builder, Key, By, until} = require("selenium-webdriver");

    const { Options: ChromeOptions } = require('selenium-webdriver/chrome');
    const webdriver = require('selenium-webdriver');

    var points = 0;
    const MAX_POINTS = 5;


    // to remove log cluttering
    const chromeOptions = new ChromeOptions();
    chromeOptions.excludeSwitches('enable-logging');

    // open html
    let driver = new webdriver.Builder()
        .forBrowser("chrome")
        .setChromeOptions(chromeOptions)
        .build();

    
    chromeOptions.headless();




    // function that enters two incomes and checks if the total income is displayed correctly
    async function testIncome(){

        // adding first income
        let titleBox = await driver.findElement(By.id("titleInput"));
        await titleBox.sendKeys("Salary1");
        

        let amountBox = await driver.findElement(By.id("amountInput"));
        await amountBox.sendKeys(300);

        transactionArray.push(["Salary1", "$ 300.00"])
        balance = 300

        let incomeBtn = await driver.findElement(By.id("income"));
        await incomeBtn.click();

        let addBtn = await driver.findElement(By.id("addButton"));
        await addBtn.click();


        // adding second income
        titleBox = await driver.findElement(By.id("titleInput"));
        await titleBox.sendKeys("Salary2");

        amountBox = await driver.findElement(By.id("amountInput"));
        await amountBox.sendKeys(100);

        transactionArray.push(["Salary2", "$ 100.00"])
        balance += 100

        incomeBtn = await driver.findElement(By.id("income"));
        await incomeBtn.click();

        addBtn = await driver.findElement(By.id("addButton"));
        await addBtn.click();


        // testing whether total was added properly
        incomeDisplay = await driver.findElement(By.id("incomeDisplay")).getText();
        if (incomeDisplay == "$ 400.00"){
            points += 1;
            results.push(["Income total", "&#9989"])

        }
        else{
            results.push(["Income total", "&#10060"])
        }

    }


    // function that enters two expences and checks if the total expence is displayed correctly
    async function testExpence(){

        // adding first expence
        let titleBox = await driver.findElement(By.id("titleInput"));
        await titleBox.sendKeys("Bill1");

        let amountBox = await driver.findElement(By.id("amountInput"));
        await amountBox.sendKeys(100);

        transactionArray.push(["Bill1", "$ 100.00"])
        balance -= 100

        let expenceBtn = await driver.findElement(By.id("expence"));
        await expenceBtn.click();

        let addBtn = await driver.findElement(By.id("addButton"));
        await addBtn.click();


        // adding second expence
        titleBox = await driver.findElement(By.id("titleInput"));
        await titleBox.sendKeys("Bill2");

        amountBox = await driver.findElement(By.id("amountInput"));
        await amountBox.sendKeys(100);

        transactionArray.push(["Bill2", "$ 100.00"])
        balance -= 100

        expenceBtn = await driver.findElement(By.id("expence"));
        await expenceBtn.click();

        await addBtn.click();


        // testing whether total was added properly
        expenceDisplay = await driver.findElement(By.id("expenceDisplay")).getText();
        if (expenceDisplay == "$ 200.00"){
            points += 1;
            results.push(["Expence total", "&#9989"])
        }
        else{
            results.push(["Expence total", "&#10060"])
        }

        // testing if insufficient balance message is given
        titleBox = await driver.findElement(By.id("titleInput"));
        await titleBox.sendKeys("Bill3");

        amountBox = await driver.findElement(By.id("amountInput"));
        await amountBox.sendKeys(1000);

        await addBtn.click();

        try{
            await driver.wait(until.alertIsPresent(), 2000);
            let alert = await driver.switchTo().alert();
            await alert.accept();
            points += 1;
            results.push(["Checking if balance greater than expence", "&#9989"])
        }
        catch{
            transactionArray.push(["Bill3", "$ 1000.00"])
            balance -= 1000
            results.push(["Checking if balance greater than expence", "&#10060"])
        }
    }


    function formatAmount(num){
        return (Math.round(num * 100) / 100).toFixed(2);
    }

    // function that ensures that the balance displayed is correct based on the above entered transactions
    async function testBalance(){

        let balanceDisplay = await driver.findElement(By.id("balanceDisplay")).getText();
        if (balanceDisplay == "$ " + formatAmount(balance)){
            points += 1;
            results.push(["Balance Total", "&#9989"])
        }
        else{
            results.push(["Balance Total", "&#10060"])
        }
    }


    // checks the order of the transactions displayed in the history list, and 
    // tests whether the entered amounts are displayed correctly for the entered transactions
    // (added transactions were saved in transactionArray)
    async function testHistory(){

        let historyRoot = await driver.findElement(By.id('historyList'));
        let historyList = await historyRoot.findElements(By.className('transaction-box'));

        let valid = true

        if (historyList.length != transactionArray.length){
            valid = false
        }
        else{
            let length = transactionArray.length
            for (let i = 0; i < length; i++){
                if (!(await historyList[i].getText()).includes(transactionArray[length - i - 1][0]) || !(await historyList[i].getText()).includes(transactionArray[length - i - 1][1])){
                    valid = false
                }
            }
        }

        if (valid){
            points += 1
            results.push(["Transaction history ordering and amounts", "&#9989"])
        }
        else{
            results.push(["Transaction history order and amounts", "&#10060"])
        }
    }

    let pathErr = false
    let first = fp.split(':')[0]

    if (first.length == fp.length){
        pathErr = true
    }
    let sliced = fp.slice(first.length)
    if (sliced[0] != ':'){
        pathErr = true
    }

    if (!pathErr){
        driver.get(FILE_PATH)

        await testIncome();
        await testExpence();
        await testBalance();
        await testHistory();

        driver.quit()

        globalString = `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8"/>
            <title>Transactions React Challenge Results Template</title>
            <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700" rel="stylesheet">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.1/font/bootstrap-icons.css">
            <script>
                function back(){
                    location.href = "index.html";
                }
            </script>
        </head>
        <body style="background-color: #2f6fa3;">
            <div id="container">
                <div id="title" style="color: #d0dfe8; font-size: 3em; margin-bottom: 1em; text-align: center;">
                    <u><strong>TEST DETAILS</strong></u>
                </div>
                <div id="table" style="background-color:white; width: 75%; margin: auto;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col" style="font-size: 1.35em;"></th>
                                <th scope="col" style="font-size: 1.35em;"></th>
                                <th scope="col" style="font-size: 1.35em;">Tested Property</th>
                                <th scope="col" style="font-size: 1.35em;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th scope="row" style="font-size: 1.25em;">Income</th>
                                <th scope="row"></th>
                                <td>${results[0][0]}</td>
                                <td>${results[0][1]}</td>
                                <td></td>
                                <td></td>
                            </tr>

                            <tr>
                                <th scope="row" style="font-size: 1.25em;">Expence</th>
                                <th scope="row"></th>
                                <td>${results[1][0]}</td>
                                <td>${results[1][1]}</td>
                                <td></td>
                                <td></td>
                        
                            </tr>
                                <tr>
                                <th scope="row" style="font-size: 1.25em;">Balance Check</th>
                                <th scope="row"></th>
                                <td>${results[2][0]}</td>
                                <td>${results[2][1]}</td>
                                <td></td>
                                <td></td>
                            </tr>

                            <tr>
                                <th scope="row" style="font-size: 1.25em;">Balance Total</th>
                                <th scope="row"></th>
                                <td>${results[3][0]}</td>
                                <td>${results[3][1]}</td>
                                <td></td>
                                <td></td>
                            </tr>
                                

                            <tr>
                                <th scope="row" style="font-size: 1.25em;">History</th>
                                <th scope="row"></th>
                                <td>${results[4][0]}</td>
                                <td>${results[4][1]}</td>
                                <td></td>
                                <td></td>
                            </tr>

                        </tbody>
                    </table>
                </div><br><br>  
                <div id="totalScore">
                    <div id="subtitle" style="color: #d0dfe8; font-size: 1.5em; margin-bottom: 1em; text-align: center;">
                        <strong>Final Results</strong>
                    </div>
                    <div class="card text-dark bg-light mb-3" style="width: 50%; margin: auto;">
                        <div class="card-header">Code Status</div>
                        <div class="card-body">
                        <h5 class="card-title">Performance Score</h5>
                        <p class="card-text">Congratulations! You have a final score of <strong>${points}/${MAX_POINTS}</strong> based on the test results shown above.</p>
                        </div>
                    </div>
                    <div class="col text-center">
                        <button type="button" class="btn btn-light" onClick="back()" style="margin-top: 1.5rem; margin-bottom: 0.5em;"><i class="bi bi-arrow-left"></i> Retry</button>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `
    }
    else{
        globalString = "Provided file path is invalid"
    }
    callback();

}

