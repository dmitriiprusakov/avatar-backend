import TelegramBot, { Message } from "node-telegram-bot-api";
import { Cache } from "types";
import { Logger } from "winston";

interface DrawParams {
	bot: TelegramBot,
	message: Message,
	cache: Cache,
	logger: Logger,
}
export const drawHandler = async ({ bot, message, cache, logger }: DrawParams) => {
	const { from } = message;
	const { id, username = "anonymous" } = from;

	try {
		if (!cache[id]?.links?.length) {
			await bot.sendMessage(
				id,
				"Пришлите фотографии, чтобы их затюнить!"
			);
			return;
		}

		if (!cache[id].sex) {
			await bot.sendMessage(
				id,
				"Кто на выбранных фотографиях?",
				{
					reply_markup: {
						inline_keyboard: [
							[{ text: "Женщина", callback_data: "sex/woman" }],
							[{ text: "Мужчина", callback_data: "sex/man" }],
						],
					},
				}
			);
		}

		logger.log({
			level: "info",
			message: `C /draw from ${id} ${username}`,
		});

		return;
	} catch (error) {
		logger.log({
			level: "error",
			message: `Error, C /draw from ${id} ${username}, ${error}`,
		});
	}
};
