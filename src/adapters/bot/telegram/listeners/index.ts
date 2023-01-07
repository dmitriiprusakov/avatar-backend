import { ExternalServices } from "adapters/externals";
import { FirestoreRepository } from "adapters/repository";
import TelegramBot from "node-telegram-bot-api";
import { Cache, MessagesCache } from "types";
import { Logger } from "winston";

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
	logger: Logger,
	externals: ExternalServices
}
const initListeners = ({ bot, cache, messagesCache, repository, externals, logger }: InitListeners) => {
	bot.on(
		"text",
		(message) => textListener({ bot, message, cache, messagesCache, repository, logger })
	);
	bot.on(
		"callback_query",
		(query) => callbackQueryListener({ bot, query, cache, messagesCache, logger, externals })
	);
	bot.on(
		"pre_checkout_query",
		(query) => preCheckoutQueryListener({ bot, query, cache, logger })
	);
	bot.on(
		"successful_payment",
		(message) => successfulPaymentListener({ bot, message, cache, repository, externals, logger })
	);
	bot.on(
		"photo",
		(message) => photoListener({ bot, cache, messagesCache, message, logger })
	);
	bot.on(
		"document",
		(message) => documentListener({ bot, cache, message, logger })
	);
};

export default initListeners;
