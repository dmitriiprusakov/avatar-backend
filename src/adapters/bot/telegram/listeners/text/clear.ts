import TelegramBot, { Message } from "node-telegram-bot-api";
import { Cache } from "types";
import { Logger } from "winston";

interface ClearParams {
	bot: TelegramBot,
	message: Message,
	cache: Cache,
	logger: Logger,
}
export const clearHandler = async ({ bot, message, cache, logger }: ClearParams) => {
	const { from } = message;
	const { id, username = "anonymous" } = from;

	try {
		delete cache[id];
		await bot.sendMessage(id, "Ранее загруженные фото убраны из набора, загрузите новые");

		logger.log({
			level: "info",
			message: `C /clear from ${id} ${username}`,
		});

		return;
	} catch (error) {
		logger.log({
			level: "error",
			message: `Error, C /clear from ${id} ${username}, ${error}`,
		});
	}
};
