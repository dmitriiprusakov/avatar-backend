import { ExternalServices } from "../../../externals";
import TelegramBot from "node-telegram-bot-api";

import { callbackQueryListener } from "./callback-query";
import { messageListener } from "./message";
import { preCheckoutQueryListener } from "./pre-checkout-query";
import { Cache, MessagesCache } from "../../../../types";
import { FirestoreRepository } from "../../../../adapters/repository";
import { successfulPaymentListener } from "./successful-payment";
import { photoListener } from "./photo";
import { documentListener } from "./document";

interface InitListeners {
	bot: TelegramBot,
	cache: Cache,
	messagesCache: MessagesCache,
	repository: FirestoreRepository,
	externals?: ExternalServices
}

const initListeners = ({ bot, cache, messagesCache, repository, externals }: InitListeners) => {
	bot.on(
		"text",
		(message) => messageListener({ bot, message, cache, messagesCache, repository })
	);
	bot.on(
		"callback_query",
		(query) => callbackQueryListener({ bot, query, cache })
	);
	bot.on(
		"pre_checkout_query",
		(query) => preCheckoutQueryListener({ bot, query })
	);
	bot.on(
		"successful_payment",
		(message) => successfulPaymentListener({ bot, message, cache, externals })
	);
	bot.on(
		"photo",
		(message) => photoListener({ bot, cache, message })
	);
	bot.on(
		"document",
		(message) => documentListener({ bot, cache, message })
	);
};

export default initListeners;
