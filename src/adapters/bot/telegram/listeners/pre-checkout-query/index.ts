import TelegramBot, { PreCheckoutQuery } from "node-telegram-bot-api";
import { Cache } from "types";
import { Logger } from "winston";

interface PreCheckoutQueryListener {
	bot: TelegramBot,
	query: PreCheckoutQuery,
	cache: Cache,
	logger: Logger,
}
const preCheckoutQueryListener = async ({ bot, query, cache, logger }: PreCheckoutQueryListener) => {
	try {
		const { id: queryId, from } = query;
		const { id, is_bot, username = "anonymous" } = from;

		if (is_bot) return;

		if (cache[id]?.links?.length && cache[id]?.sex) {
			await bot.answerPreCheckoutQuery(queryId, true);

			logger.log({
				level: "info",
				message: `P_Q from ${id} ${username}`,
			});
		} else {
			delete cache[id];
			await bot.sendMessage(id, "😿 Что-то пошло не так, пожалуйста, используйте команду /clear и повторите попытку!");
			await bot.answerPreCheckoutQuery(queryId, false, { error_message: "😿 Что-то пошло не так, пожалуйста, используйте команду /clear и повторите попытку!" });
			logger.log({
				level: "info",
				message: `P_Q failed from ${id} ${username}`,
			});
		}
	} catch (error) {
		logger.log({
			level: "error",
			message: `Error P_Q, ${error}`,
		});
	}
};

export { preCheckoutQueryListener };
