import * as twilio from 'twilio';
import * as puppeteer from 'puppeteer';


async function scan()
{
 
    setInterval(async () => {
        var result = await loadWebpage('https://www.tesla.com/inventory/new/my?arrangeby=plh&zip=92109&range=200');
        if (result)
        {
            sendMessage("Found new inventory: " + result);
        }
    }, 1000);
}
scan();

async function loadWebpage(uri: string): Promise<string>
{
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(uri);

    let result = '';
    await page.waitForSelector('.result-purchase-price', { timeout: 2000 });
    const query = await page.$('.result-purchase-price');
    if (!!query)
    {
        result = await page.evaluate(el => el.textContent, query);
    }

    await browser.close();
    return result;
}

async function sendMessage(message: string)
{
    // Twilio Credentials
    // To set up environmental variables, see http://twil.io/secure
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const recipient = process.env.TWILIO_RECIPIENT;
    const sender = process.env.TWILIO_SENDER;

    // require the Twilio module and create a REST client
    // const client = require('twilio')(accountSid, authToken);
    const client = (<any>twilio)(accountSid, authToken);

    try
    {
        await client.messages
        .create({
            to: recipient ?? '',
            from: sender ?? '',
            body: message,
        });
    }
    catch(err: any)
    {
        console.error('Failed to send message: ' + err);
    }
    console.log('Successfully sent message!');
}
