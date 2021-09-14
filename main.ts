import twilio from 'twilio';


async function scan()
{
    sendMessage()
}
scan();

async function sendMessage(message: string)
{
    // Twilio Credentials
    // To set up environmental variables, see http://twil.io/secure
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const recipient = process.env.TWILIO_RECIPIENT;

    // require the Twilio module and create a REST client
    // const client = require('twilio')(accountSid, authToken);
    const client = twilio(accountSid, authToken);

    try
    {
        await client.messages
        .create({
            to: ,
            from: '+15017122661',
            body: message,
        });
    }
    catch(err: any)
    {
        console.error('Failed to send message: ' + message);
    }
    console.log('Successfully sent message: ' + message);
}
