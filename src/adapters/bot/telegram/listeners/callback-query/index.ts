import TelegramBot, { CallbackQuery } from "node-telegram-bot-api";
import { Cache } from "../../../../../types";
import { paymentQueryHandler } from "./payment";
import { sexQueryHandler } from "./sex";

type CallbackQueryListener = {
	bot: TelegramBot;
	query: CallbackQuery;
	cache: Cache;
}
const callbackQueryListener = async ({ bot, query, cache }: CallbackQueryListener) => {
	const { from, data } = query;

	if (from.is_bot) return;

	const [queryType] = data.split("/");

	if (queryType === "sex") return sexQueryHandler({ bot, query, cache });

	if (queryType === "payment") return paymentQueryHandler({ bot, query });
};

export { callbackQueryListener };
