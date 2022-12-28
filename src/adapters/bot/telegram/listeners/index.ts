import { ExternalServices } from "adapters/externals";
import { FirestoreRepository } from "adapters/repository";
import TelegramBot from "node-telegram-bot-api";
import { Cache, MessagesCache } from "types";

import { callbackQueryListener } from "./callback-query";
import { documentListener } from "./document";
import { photoListener } from "./photo";
import { preCheckoutQueryListener } from "./pre-checkout-query";
import { successfulPaymentListener } from "./successful-payment";
import { textListener } from "./text";

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
		(message) => textListener({ bot, message, cache, messagesCache, repository })
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
