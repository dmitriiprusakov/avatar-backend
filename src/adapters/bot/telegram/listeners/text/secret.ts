import { FirestoreRepository } from "adapters/repository";
import TelegramBot, { Message } from "node-telegram-bot-api";
import { Cache } from "types";
import { Logger } from "winston";

interface SecretParams {
	bot: TelegramBot,
	message: Message,
	cache: Cache,
	logger: Logger,
	repository: FirestoreRepository,
}
export const secretHandler = async ({ bot, message, cache, logger, repository }: SecretParams) => {
	const { text, from } = message;
	const { id, username = "anonymous" } = from;

	try {
		const isSecret = await repository.CheckSecret({ code: text.replace("secret::", "") });

		if (isSecret) {
			cache[id] = Object.assign(cache[id] || {}, {
				free: true,
			});
			await bot.sendMessage(id, `Секретный код ||${text}|| активирован\\!`, { parse_mode: "MarkdownV2" });

			logger.log({
				level: "info",
				message: `Secret from ${id} ${username}`,
			});
		} else {
			await bot.sendMessage(id, "Не совсем понял, что вы имеете ввиду!");
		}
	} catch (error) {
		logger.log({
			level: "error",
			message: `Error, Secret from ${id} ${username}, ${error}`,
		});
	}
};
