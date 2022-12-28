import TelegramBot, { CallbackQuery } from "node-telegram-bot-api";
import { Cache } from "types";
import { Logger } from "winston";

import { paymentQueryHandler } from "./payment";
import { sexQueryHandler } from "./sex";

type CallbackQueryListener = {
	bot: TelegramBot;
	query: CallbackQuery;
	cache: Cache;
	logger: Logger;
}
const callbackQueryListener = async ({ bot, query, cache, logger }: CallbackQueryListener) => {
	const { from, data } = query;

	if (from.is_bot) return;

	const [queryType] = data.split("/");

	if (queryType === "sex") return sexQueryHandler({ bot, query, cache, logger });

	if (queryType === "payment") return paymentQueryHandler({ bot, query, logger });
};

export { callbackQueryListener };
