# Slack Bot
A tutorial on creating a Node.js Slack bot using AWS Lambda with AWS API Gateway.

![Slack Bot](https://c2.staticflickr.com/2/1562/25554826086_0e79e3b88d_o.png)

## Build Status
[![Build Status](https://travis-ci.org/lesterchan/slack-bot.svg?branch=master)](https://travis-ci.org/lesterchan/slack-bot)

## Setup
I am choosing Asia Pacific (Singapore) region for AWS Lambda and Asia Pacific (Singapore) region for AWS API Gateway.

### Checkout Code
```
$ git clone https://github.com/lesterchan/slack-bot.git  
$ cd slack-bot  
$ npm install --production  
$ zip -r slack-bot.zip *.js node_modules/*
```

### AWS Lambda
1. Go to [AWS Lambda](https://ap-southeast-1.console.aws.amazon.com/lambda/home?region=ap-southeast-1).
2. Click "Get Started Now".
3. Under the "Select blueprint" screen, search for "hello-world"and you will see the hello-world blueprint which says "A starter AWS Lambda function.".
4. Click on "hello-world" (NOT "hello-world-python").
5. You will be brought to the "Configure Function" page.
6. Under "Name", you can choose any name for your function. I called it "slack-bot".
7. Under "Runtime", ensure it is "Node.js".
8. Under "Code entry type", choose "Upload a .ZIP file" and click the "Upload" button" to browse for the file "slack-bot.zip" which you have zipped previously.
9. Under "Handler", we leave it as "index.handler".
10. Under "Role", we choose "Basic Execution Role".
11. You will be brought to a "Role Summary" page.
12. Under "IAM Role", choose "lambda_basic_execution".
13. Under "Role Name", choose "oneClick_lambda_basic_execution_.....".
14. Click "Allow".
15. You will be brought back to the "Configure Function" page.
16. Leave "Memory (MB)" as "128MB".
17. You might want to increase "Timeout" to "15" seconds.
18. Under VPC, choose "No VPC".
19. Click "Next".
20. Click "Create function".

### AWS API Gateway
1. Go to [AWS API Gateway](https://ap-southeast-1.console.aws.amazon.com/apigateway/home?region=ap-southeast-1).
2. Click "Get Started Now".
3. Under "API name", enter the name of your API. I will just name it "Slack Bot".
4. Click "Create API".
5. You will be redirected to the "Resources" page.
6. Click "Create Method" and on the dropdown menu on the left, choose "POST" and click on the "tick" icon.
7. Now, you will see the "/ - POST - Setup" page on the right.
8. Under "Integration Type", choose "Lambda Function".
9. Under "Lambda Region", choose "ap-southeast-1".
10. Under "Lambda Function", type "slack" and it should auto-complete it to "slack-bot".
11. Click "Save" and "Ok" when the popup appears.
12. You will be brought to the "/ - POST - Method Execution" Page.
13. Click "Integration Request".
14. Click "Mapping Templates" and the section should expand.
15. Click "Add Mapping Template" and type in "application/x-www-form-urlencoded" and click on the "tick" icon.
16. Under "Input Passthrough" on the right, click on the "pencil" icon.
16. Choose "Mapping Template" on the dropdown that appears.
17. Copy and paste [this GitHub Gist](https://gist.githubusercontent.com/ryanray/668022ad2432e38493df/raw/a3b8c765791ac6cfc15811a5dcb2d97056adc107/aws-api-gateway-form-to-json.ftl) to the template box.
18. Click on the "tick" icon beside the dropdown once you are done.
19. This GitHub Gist will covert the your API Gateway data from application/x-www-form-urlencoded to application/json.
20. Click on "Deploy API" button on the top left.
21. Under "Deployment Stage", click "New Stage".
22. Under "Stage Name", I will type in "production".
23. Click "Deploy".
24. Note the "Invoke URL" at the top and your API is now live.

### Slack
1. Go to [Slack Apps](https://slack.com/apps).
2. Search for "Outgoing WebHooks".
3. Click "Install" besides the team you wanted.
4. Click "Add Outgoing WebHook Integration".
5. Scroll down to "Integration Settings" section.
6. Under "Channel", choose "Any".
7. Under "Trigger Word(s)", type in "bus,haze,weather,ipinfo,socialstats" (without the quotes).
8. Under "URL(s)", type in your "Invoke URL" as noted above.
9. Customize "Descriptive Label", "Name" and "Icon" to your liking and click "Save Settings".
10. You are all set.

### Testing via CLI
Do a CURL to see if your Lambda and API integration works.  
```
$ curl --data "text=haze&trigger_word=haze" <Invoke URL>
```

You should see the response something like that:  
```
{  
    "attachments":[  
        {  
            "pretext":":cloud: *Haze*",
            "title":"PM2.5 Hourly Update",
            "text":"Last updated at _14:00, 7th March 2016_",
            "fallback":"Average: 11, Central: 10, North: 9, South: 16, East: 10, West: 9",
            "mrkdwn_in":[  
                "pretext",
                "text"
            ],
            "color":"#479b02",
            "fields":[  
                {  
                    "title":"Average",
                    "value":"11",
                    "short":true
                },
                {  
                    "title":"Central",
                    "value":"10",
                    "short":true
                },
                {  
                    "title":"North",
                    "value":"9",
                    "short":true
                },
                {  
                    "title":"South",
                    "value":"16",
                    "short":true
                },
                {  
                    "title":"East",
                    "value":"10",
                    "short":true
                },
                {  
                    "title":"West",
                    "value":"9",
                    "short":true
                }
            ]
        }
    ]
}
```

### Testing via Slack
1. Type in "haze" (without the quotes) in any Slack channel.
2. You should get back a nicely formatting response as shown in the first screenshot.

## Commands
### Singapore Bus Arrival Timings 
Usage: ```bus <busStopNo> <busNo>```  
Example: ```bus 30111 991```

Usage: ```bus <busStopNo>```  
Example: ```bus 44591```

### Singapore Haze Situation
Usage: ```haze```  
Example: ```haze```

### Singapore Weather 2 Hour Forecast
Usage: ```weather```  
Example: ```weather```

### IP Information
Usage: ```ipinfo <ip>```  
Example: ```ipinfo 8.8.8.8```

### Social Stats Count For Links
Usage: ```socialstats <url>```  
Example: ```socialstats https://lesterchan.net```

## Credits
* Ryan Ray: [Serverless Slack Integrations with node.js, AWS Lambda, and AWS API Gateway](http://www.ryanray.me/serverless-slack-integrations).

## See Also
[Telegram Bot using AWS API Gateway and AWS Lamda](https://github.com/lesterchan/telegram-bot)
