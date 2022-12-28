import { FirestoreRepository } from "adapters/repository";
import TelegramBot, { Message } from "node-telegram-bot-api";
import { Cache, MessagesCache } from "types";
import { Logger } from "winston";

import { clearHandler } from "./clear";
import { drawHandler } from "./draw";
import { helpHandler } from "./help";
import { startHandler } from "./start";

interface TextListener {
	bot: TelegramBot,
	message: Message,
	cache: Cache,
	messagesCache: MessagesCache,
	repository: FirestoreRepository,
	logger: Logger,
}
const textListener = async ({ bot, message, cache, repository, logger }: TextListener) => {
	const { text, from } = message;
	const { is_bot, id, username = "anonymous" } = from;

	if (is_bot) return;

	try {
		if (text === "/start") return startHandler({ bot, repository, message, logger });

		if (text === "/help") return helpHandler({ bot, message, logger });

		if (text === "/clear") return clearHandler({ bot, message, cache, logger });

		if (text === "/draw") return drawHandler({ bot, message, cache, logger });

		await bot.sendMessage(id, "Не совсем понял, что вы имеете ввиду!");
	} catch (error) {
		logger.log({
			level: "error",
			message: `Global Error M, ${error}, ${username}`,
		});
	}
};

export { textListener };
