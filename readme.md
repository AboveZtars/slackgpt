# slackgpt

A simple integration of slack with openAi to summarize the data of a chat

To start the project run `npm run start`

# How to run this project on your own

Create an app in slack and do the following:

## Enable Events and suscribe to bot events:

- app_mention
- message.channels
- message.groups
- message.im
- message.mpim

## Enable Socket Mode

## Set bot token scopes

The slack app needs to have the following scopes at the bot token scopes:

- app_mentions:read
- channels:history
- channels:read
- chat:write
- groups:history
- groups:read
- im:history
- mpim:history
- users:read

## Enviroment Variables

- SLACK_SIGNING_SECRET
- SLACK_BOT_TOKEN
- SLACK_APP_TOKEN

and in OpenAi get an API Key:

- OPENAI_API_KEY
