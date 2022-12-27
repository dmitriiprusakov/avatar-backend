import { ExternalServices } from "../../../externals";
import TelegramBot from "node-telegram-bot-api";

import { callbackQueryListener } from "./callback-query";
import { messageListener } from "./message";
import { preCheckoutQueryListener } from "./pre-checkout-query";
import { Cache, MessagesCache } from "../../../../types";
import { FirestoreRepository } from "../../../../adapters/repository";

interface InitListeners {
	bot: TelegramBot,
	cache: Cache,
	messagesCache: MessagesCache,
	repository: FirestoreRepository,
	externals?: ExternalServices
}

const initListeners = ({ bot, cache, messagesCache, repository, externals }: InitListeners) => {
	bot.on(
		"message",
		(message) => messageListener({ bot, message, cache, messagesCache, repository, externals })
	);
	bot.on(
		"callback_query",
		(query) => callbackQueryListener({ bot, query, cache })
	);
	bot.on(
		"pre_checkout_query",
		(query) => preCheckoutQueryListener({ bot, query, cache })
	);
};

export default initListeners;
