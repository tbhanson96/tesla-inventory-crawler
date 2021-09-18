import { Browser } from 'puppeteer';
import * as twilio from 'twilio';
const puppeteer = require('puppeteer');


let client: twilio.Twilio;
try
{
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    // require the Twilio module and create a REST client
    // const client = require('twilio')(accountSid, authToken);
    client = (<any>twilio)(accountSid, authToken);
}
catch(e)
{
    console.error('Failed to initialized twilio client');
}

function scan()
{
 
    let lastResult = '';
    const webpage = process.env.TESLA_URL || 'www.google.com';// lol
    setInterval(() => {
        loadWebpage(webpage).then(result => {
            if (!!result && result != lastResult)
            {
                sendMessage("Found new inventory: " + result + "link: " + webpage);
                console.log("found new inventory: " + result);
                lastResult = result;
            }
            else if (!result)
            {
                console.log("no inventory found :(");
            }
            else
            {
                console.log("Inventory still available!!");
            }
        });
    }, 5000);
}
scan();

async function loadWebpage(uri: string): Promise<string>
{
    const browser: Browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(uri);

    let result: string[] = [];
    try
    {
        await page.waitForSelector('.result, .card', { timeout: 2000 });
    }
    catch (e)
    {
        // do nothing
    }

    let elements = await page.$$('.result, .card');
    for(const e of elements)
    {
        var subElems = await e.$$('.tds-list-item');
        for (const sub of subElems)
        {

            const text = await page.evaluate(e => e.textContent, sub);
            if (text?.toString()?.includes(process.env.TESLA_COLOR))
            {
                const priceElem = await e.$('.result-purchase-price');
                var price = await page.evaluate(e => e.textContent, priceElem);
                result.push(price);
            }
        }
    }

    await browser.close();
    return result.join(', ');
}

async function sendMessage(message: string)
{
    // Twilio Credentials
    // To set up environmental variables, see http://twil.io/secure
    const recipient = process.env.TWILIO_RECIPIENT;
    const sender = process.env.TWILIO_SENDER;


    try
    {
        await client?.messages
        .create({
            to: recipient ?? '',
            from: sender ?? '',
            body: message,
        });
        console.log('Successfully sent message!');
    }
    catch(err: any)
    {
        console.error('Failed to send message: ' + message);
    }
}
