import TelegramBotApi from "node-telegram-bot-api";

import initListeners from "./listeners";

import { ExternalServices } from "../../externals";
import { FirestoreRepository } from "../../../adapters/repository";
import { Cache, MessagesCache } from "../../../types";

const BOT_TOKEN = process.env.BOT_TOKEN;

interface initTelegramBot {
	cache?: Cache,
	messagesCache?: MessagesCache,
	repository?: FirestoreRepository
	externals?: ExternalServices,
}

const initTelegramBot = ({ cache, messagesCache, repository = null, externals }: initTelegramBot) => {
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
