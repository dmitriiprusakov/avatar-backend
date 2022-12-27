import { logger } from "../../../../logger";
import TelegramBot, { PreCheckoutQuery } from "node-telegram-bot-api";
import { Cache } from "../../../../types";

interface PreCheckoutQueryListener {
	bot: TelegramBot,
	query: PreCheckoutQuery,
	cache: Cache
}
const preCheckoutQueryListener = async ({ bot, query, cache }: PreCheckoutQueryListener) => {
	try {
		const { from } = query;
		const { id, is_bot, username = "anonymous" } = from;

		if (is_bot) return;

		if (!cache[id]) {
			await bot.answerPreCheckoutQuery(
				query.id, false,
				{ error_message: "Этот заказ уже оплачен. Чтобы заказать еще больше стильных аватарок, загрузите новые фотографии!" }
			);
			return;
		}
		await bot.answerPreCheckoutQuery(query.id, true);

		logger.log({
			level: "info",
			message: `P_Q from ${id} ${username}`,
		});
	} catch (error) {
		logger.log({
			level: "error",
			message: `Error P_Q, ${error}`,
		});
	}
};

export { preCheckoutQueryListener };
