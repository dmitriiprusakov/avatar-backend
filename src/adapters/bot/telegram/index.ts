import { ExternalServices } from "adapters/externals";
import { FirestoreRepository } from "adapters/repository";
import TelegramBotApi from "node-telegram-bot-api";
import { Cache, MessagesCache } from "types";
import { Logger } from "winston";

import initListeners from "./listeners";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

interface InitTelegramBot {
	logger?: Logger,
	cache?: Cache,
	messagesCache?: MessagesCache,
	repository?: FirestoreRepository
	externals?: ExternalServices,
}

const initTelegramBot = ({ logger, cache, messagesCache, repository = null, externals }: InitTelegramBot) => {
	const bot = new TelegramBotApi(TELEGRAM_BOT_TOKEN, { polling: true });

	bot.setMyCommands([
		{ command: "/start", description: "Начать" },
		{ command: "/help", description: "Помощь" },
		{ command: "/clear", description: "Сбросить загруженное" },
	]);

	initListeners({ bot, cache, messagesCache, repository, logger, externals });

	return bot;
};

export { initTelegramBot };
