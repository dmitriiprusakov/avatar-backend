import TelegramBot, { PreCheckoutQuery } from "node-telegram-bot-api";
import { Logger } from "winston";

interface PreCheckoutQueryListener {
	bot: TelegramBot,
	query: PreCheckoutQuery,
	logger: Logger,
}
const preCheckoutQueryListener = async ({ bot, query, logger }: PreCheckoutQueryListener) => {
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
