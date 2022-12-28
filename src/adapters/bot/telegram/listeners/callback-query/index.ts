import { ExternalServices } from "adapters/externals";
import TelegramBot, { CallbackQuery } from "node-telegram-bot-api";
import { Cache, MessagesCache } from "types";
import { Logger } from "winston";

import { paymentQueryHandler } from "./payment";
import { sexQueryHandler } from "./sex";

type CallbackQueryListener = {
	bot: TelegramBot;
	query: CallbackQuery;
	cache: Cache;
	messagesCache: MessagesCache;
	logger: Logger;
	externals: ExternalServices
}
const callbackQueryListener = async ({ bot, query, cache, messagesCache, logger, externals }: CallbackQueryListener) => {
	const { from, data } = query;

	if (from.is_bot) return;

	const [queryType] = data.split("/");

	if (queryType === "sex") return sexQueryHandler({ bot, query, cache, messagesCache, logger });

	if (queryType === "payment") return paymentQueryHandler({ bot, query, cache, messagesCache, logger, externals });
};

export { callbackQueryListener };
