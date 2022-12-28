import { FirestoreRepository } from "adapters/repository";
import { logger } from "logger";
import TelegramBot, { Message } from "node-telegram-bot-api";
import { Cache, MessagesCache } from "types";

import { clearHandler } from "./clear";
import { drawHandler } from "./draw";
import { helpHandler } from "./help";
import { startHandler } from "./start";

interface MessageListener {
	bot: TelegramBot,
	message: Message,
	cache: Cache,
	messagesCache: MessagesCache,
	repository: FirestoreRepository,
}
const messageListener = async ({ bot, message, cache, repository }: MessageListener) => {
	const { text, from } = message;
	const { is_bot, id, username = "anonymous" } = from;

	if (is_bot) return;

	try {
		if (text === "/start") return startHandler({ bot, repository, message });

		if (text === "/help") return helpHandler({ bot, message });

		if (text === "/clear") return clearHandler({ bot, message, cache });

		if (text === "/draw") return drawHandler({ bot, message, cache });

		await bot.sendMessage(id, "Не совсем понял, что вы имеете ввиду!");
	} catch (error) {
		logger.log({
			level: "error",
			message: `Global Error M, ${error}, ${username}`,
		});
	}
};

export { messageListener };
