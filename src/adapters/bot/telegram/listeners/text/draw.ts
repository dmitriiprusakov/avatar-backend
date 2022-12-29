import { t } from "i18next";
import TelegramBot, { Message } from "node-telegram-bot-api";
import { Cache, MessagesCache } from "types";
import { Logger } from "winston";

interface DrawParams {
	bot: TelegramBot,
	message: Message,
	cache: Cache,
	messagesCache: MessagesCache,
	logger: Logger,
}
export const drawHandler = async ({ bot, message, cache, messagesCache, logger }: DrawParams) => {
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

		const { message_id } = await bot.sendMessage(
			id,
			"Кто на выбранных фотографиях?",
			{
				reply_markup: {
					inline_keyboard: [
						[{ text: t("sex.woman", { lng: "ru" }), callback_data: "sex/woman" }],
						[{ text: t("sex.man", { lng: "ru" }), callback_data: "sex/man" }],
					],
				},
			}
		);

		messagesCache[id] = Object.assign(
			messagesCache[id] || {},
			{ chooseSexMessageId: message_id }
		);

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
