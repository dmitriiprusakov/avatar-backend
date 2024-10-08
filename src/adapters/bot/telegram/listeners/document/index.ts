import TelegramBot, { Message } from "node-telegram-bot-api";
import { Cache } from "types";
import { Logger } from "winston";

const MIN_IMAGES_COUNT = 10;
const MAX_IMAGES_COUNT = 25;

interface DocumentListener {
	bot: TelegramBot,
	cache: Cache,
	message: Message,
	logger: Logger
}
const documentListener = async ({ bot, cache, message, logger }: DocumentListener) => {
	const { from, document } = message;
	const { id, is_bot, username = "anonymous" } = from;

	if (is_bot) return;

	try {
		if (!document.mime_type.includes("image")) {
			await bot.sendMessage(
				id,
				"Загрузить можно только изображения: .jpg, .jpeg, .png, .heic, .heif!"
			);
			return;
		}

		const documentLink = await bot.getFileLink(document.file_id);

		if (!cache[id] || cache[id].links.length < MAX_IMAGES_COUNT) {
			cache[id] = Object.assign(cache[id] || {}, {
				links: (cache[id]?.links || []).concat([documentLink]),
			});
		}

		if (cache[id].links.length < MIN_IMAGES_COUNT) {
			bot.sendMessage(
				id,
				`Отличная фотка, но нужно еще ${MIN_IMAGES_COUNT - cache[id].links.length}!`
			);
			return;
		}
		if (MIN_IMAGES_COUNT <= cache[id].links.length && cache[id].links.length < MAX_IMAGES_COUNT) {
			bot.sendMessage(
				id,
				`Классные фотографии, уже можно посылать на обработку /draw, а можно добавить больше фотографий, еще ${MAX_IMAGES_COUNT - cache[id].links.length}!`
			);
			return;
		}
		if (cache[id].links.length === MAX_IMAGES_COUNT) {
			bot.sendMessage(
				id,
				"Классные фотографии, уже максимальное количество, можно посылать на обработку /draw!"
			);
			return;
		}
	} catch (error) {
		logger.log({
			level: "error",
			message: `Error, D from ${id} ${username}, ${error} ${cache[id]?.links?.join(",")}`,
		});
	}
};

export { documentListener };
