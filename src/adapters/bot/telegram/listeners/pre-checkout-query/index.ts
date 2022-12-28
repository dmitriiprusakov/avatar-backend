import { logger } from "logger";
import TelegramBot, { PreCheckoutQuery } from "node-telegram-bot-api";

interface PreCheckoutQueryListener {
	bot: TelegramBot,
	query: PreCheckoutQuery,
}
const preCheckoutQueryListener = async ({ bot, query }: PreCheckoutQueryListener) => {
	try {
		const { id: queryId, from } = query;
		const { id, is_bot, username = "anonymous" } = from;

		if (is_bot) return;

		await bot.answerPreCheckoutQuery(queryId, true);

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
