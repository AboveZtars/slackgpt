import "dotenv/config.js";
import {App} from "@slack/bolt";
import {OpenAI} from "langchain/llms/openai";
import {loadSummarizationChain} from "langchain/chains";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";

export const runLLM = async (text: string) => {
  const model = new OpenAI({
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
  const textSplitter = new RecursiveCharacterTextSplitter({chunkSize: 1000});
  const docs = await textSplitter.createDocuments([text]);

  // This convenience function creates a document chain prompted to summarize a set of documents.
  const chain = loadSummarizationChain(model, {
    type: "map_reduce",
  });
  const res = await chain.call({
    input_documents: docs,
  });
  return res.text;
};

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: Number(process.env.PORT) || 3000,
});

app.use(async ({next}) => {
  await next();
});

// Listens to incoming messages that contain "hello"
app.message("start summary", async ({message, client, say}) => {
  let LLMresponse;
  try {
    // Call conversations.history with the built-in client
    const resultChatHistory = await client.conversations.history({
      channel: message.channel,
      limit: 500,
    });
    console.log("History lenght", resultChatHistory.messages?.length);
    const resultUsersList = await client.users.list();
    const userList = resultUsersList.members;
    // Filter Results to find only messages sent by users
    const filteredResults = resultChatHistory.messages?.filter(
      (message) =>
        !message.bot_id &&
        message.client_msg_id &&
        message.text !== "start summary"
    );

    const text = filteredResults
      ?.map((message) => {
        const user = userList?.find((user) => user.id === message.user);
        return `${user?.name}: ${message.text}`;
      })
      .join("\n");
    LLMresponse = await runLLM(text || "");
  } catch (error) {
    console.log(error);
  }

  // Filter out message events with subtypes (see https://api.slack.com/events/message)
  if (message.subtype === undefined || message.subtype === "bot_message") {
    // say() sends a message to the channel where the event was triggered
    await say({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Hey there <@${message.user}>! \n
            This is a sumary from your app! \n
            ${LLMresponse}
            `,
          },
        },
      ],
      text: `Hey there <@${message.user}>!
      This is a sumary from your app! ${LLMresponse}
      `,
    });
  }
});

(async () => {
  // Start your app
  await app.start(Number(process.env.PORT) || 3000);

  console.log("⚡️ Bolt app is running!");
})();
