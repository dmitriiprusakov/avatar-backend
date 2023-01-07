import { ExternalServices } from "adapters/externals";
import { FirestoreRepository } from "adapters/repository";
import TelegramBotApi from "node-telegram-bot-api";
import VkontakteBot from "node-vk-bot-api";
import { Cache, MessagesCache } from "types";
import { Logger } from "winston";

const VK_BOT_TOKEN = process.env.VK_BOT_TOKEN;

interface InitVkontakteBot {
	logger?: Logger,
	cache?: Cache,
	messagesCache?: MessagesCache,
	repository?: FirestoreRepository
	externals?: ExternalServices,
}
const initVkontakteBot = ({ logger, cache, messagesCache, repository = null, externals }: InitVkontakteBot) => {
	const bot = new VkontakteBot(VK_BOT_TOKEN);

	bot.command("/start", (ctx) => {
		ctx.reply("Hello!");
	});

	bot.startPolling();

	return bot;
};

export { initVkontakteBot };
