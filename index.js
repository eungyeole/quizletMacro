const url='https://quizlet.com/kr/577614751/coco-1-flash-cards/';
const google='https://quizlet.com/google-oauth-redirector?from=https%3A%2F%2Fquizlet.com%2Fgoodbye&amp;customParams=%7B%22signupOrigin%22%3A%22global-signup-modal-google%22%2C%22screenName%22%3A%22Logout%2FlogoutMobileSplash%22%7D';
const { default: axios } = require('axios');
const { dir } = require('console');
const {Builder,By,Key,until, promise} = require('selenium-webdriver');  
const chrome = require('selenium-webdriver/chrome');
const util = require("util")

const timeSleap = util.promisify(setTimeout);

let word={};
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}
async function login(driver){
    await driver.get(google); 
    const id=await driver.findElement(By.xpath('//*[@id="identifierId"]'));
    await id.sendKeys("201414ljh@dsm.hs.kr",Key.ENTER);
    await timeSleap(3000);
    const password=await driver.findElement(By.xpath('//*[@id="password"]/div[1]/div/div[1]/input'));
    await password.sendKeys("kk7412^^",Key.ENTER);
    await driver.wait(until.elementLocated(By.xpath('//*[@id="TopNavigationReactTarget"]/header/div/div[2]/div[4]/div[1]')),10000);
}
async function getWorld(driver){
    await driver.get(url);  
    const close=await driver.wait(until.elementLocated(By.xpath('/html/body/div[6]/div/div[1]/div/button')),10000);
    await close.click();
    await timeSleap(1000);
    driver.executeScript("window.scrollTo(0, 500)");
    await timeSleap(1000);
    const elements = await driver.findElements(By.css(".TermText"));
    console.log(elements.length);
    const pendingHtml = elements.map(function (elem) {
        return elem.getText();
    });
    for(let i in pendingHtml){
        let temp=await pendingHtml[i];
        if(i%2===0){
            word[temp]=""
        }else{
            word[(await pendingHtml[i-1])]=temp;
        }
    }
}
async function myFunction() {
	const driver = await new Builder().forBrowser('chrome').build();  
    try { 
        await login(driver);
        await getWorld(driver);
        await Dictation(driver);
        await Study(driver); 
    }

    finally {
        //await driver.quit(); 
    }
};

async function Study(driver){
    await driver.get("https://quizlet.com/577614751/learn");
    const confirm=await driver.wait(until.elementLocated(By.xpath('//*[@id="AssistantModeTarget"]/div/div/div[2]/div/div/div/div/div[2]/div/button')),10000);
    await confirm.click();
    while(true){
        try{
            let con=await driver.findElement(By.xpath('//*[@id="AssistantModeTarget"]/div/div/div[2]/div/div/div/div/div[1]/div[2]/div/button'));
            await timeSleap(5000);
            await con.click();
            await timeSleap(500);
        }catch(e){
            const question=await driver.wait(until.elementLocated(By.xpath('//*[@id="AssistantModeTarget"]/div/div/div[2]/div/div/div/div[1]/div/div[2]/div/div/div/div/div')),10000);
            let text=await question.getText();
            let result=word[text] ? word[text] : getKeyByValue(word,text);
            const textarea=await driver.wait(until.elementLocated(By.xpath('//*[@id="AssistantModeTarget"]/div/div/div[2]/div/div/div/div[2]/div/form/div[1]/div/label/div/div/div[2]/textarea')),10000);
            await textarea.sendKeys(result, Key.ENTER);
            await timeSleap(500);
        }
        
    }
    
}

async function Dictation(driver){
    await driver.get("https://quizlet.com/577614751/spell"); 
    while(true){
        try{
            const con=await driver.wait(until.elementLocated(By.xpath('//*[@id="AssistantModeTarget"]/div/div/div/div[2]/div/div/div[1]/div/button')),1000);
            await con.click();
                
        } catch(e){
            try{
                await driver.findElement(By.xpath('//*[@id="AssistantModeTarget"]/div/div/div/div[2]/div/div/div[1]/header/h2'));
                break;
            }catch(e){
                let elements = await driver.wait(until.elementLocated(By.css(".SpellQuestionView-inputPrompt--plain")),10000);
                let text=await elements.getText();
                let textarea=await driver.wait(until.elementLocated(By.xpath('//*[@id="AssistantModeTarget"]/div/div/div/div[2]/div/div/div[1]/div[2]/div/label/div/div[1]/div[2]/textarea')),10000);
                await textarea.sendKeys(getKeyByValue(word, text), Key.ENTER);
            }
            await timeSleap(500);
        }
    }
}

myFunction();

async function dms(id, password){
    let { data } = await axios.post("https://api.dsm-dms.com/account/auth",{
        id : id,
        password : password
    });

    while(true){
        try {
            await axios.post("https://api.dsm-dms.com/apply/extension/12", {
                classNum: 8,
                seatNum: 1
            },{
                headers : {
                    authorization : data.accessToken
                }
            })
        }catch(e){
            e.response.status===403 ? console.log("연장신청 시간이 아닙니다.") : console.log("연장신청 실패");
            
        }
    }
}

//dms("akfh278","ash44601@")