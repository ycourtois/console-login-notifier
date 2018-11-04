import SNS = require("aws-sdk/clients/sns");
import {config} from "aws-sdk";
import {LOGIN_RESULT} from "./event-enum";

// Set region
config.update({region: 'eu-west-1'});

export async function lambdaHandler(event, context, callback) {

    let subject = `[AWS Console] : ${event.detail.userIdentity.userName}`;
    switch (event.detail.responseElements.ConsoleLogin) {
        case LOGIN_RESULT.SUCCESS:
            subject += ' successfully logged in to AWS console';
            break;
        case LOGIN_RESULT.FAILURE:
            subject += ' failed to logged in';
            break;
        default:
            throw new Error('Unknown login result [' + event.detail.responseElements.ConsoleLogin + ']');
    }

    // Create publish parameters
    var params = {
        Subject: subject,
        Message: JSON.stringify(event, null, 4),
        TopicArn: 'arn:aws:sns:eu-west-1:930910079852:loginAttemptWatcher'
    };

    // Create promise and SNS service object
    var publishTextPromise = new SNS({apiVersion: '2010-03-31'}).publish(params).promise();

    // Handle promise's fulfilled/rejected states
    await publishTextPromise.then(
        function (data) {
            // console.log(`Message ${params.Message} send sent to the topic ${params.TopicArn}`);
            // console.log("MessageID is " + data.MessageId);
            callback(null, "Notification sent");
        }).catch(
        function (err) {
            console.error(err, err.stack);
        });
    // context.callbackWaitsForEmptyEventLoop = false;
};

