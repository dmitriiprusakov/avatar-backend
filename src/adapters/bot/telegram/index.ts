import { ExternalServices } from "adapters/externals";
import { FirestoreRepository } from "adapters/repository";
import TelegramBotApi from "node-telegram-bot-api";
import { Cache, MessagesCache } from "types";

import initListeners from "./listeners";

const BOT_TOKEN = process.env.BOT_TOKEN;

interface InitTelegramBot {
	cache?: Cache,
	messagesCache?: MessagesCache,
	repository?: FirestoreRepository
	externals?: ExternalServices,
}

const initTelegramBot = ({ cache, messagesCache, repository = null, externals }: InitTelegramBot) => {
	const bot = new TelegramBotApi(BOT_TOKEN, { polling: true });

	bot.setMyCommands([
		{ command: "/start", description: "Начать" },
		{ command: "/help", description: "Помощь" },
		{ command: "/clear", description: "Сбросить загруженное" },
	]);

	initListeners({ bot, cache, messagesCache, repository, externals });

	return bot;
};

export { initTelegramBot };
