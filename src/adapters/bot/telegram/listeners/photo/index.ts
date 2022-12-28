import { logger } from "logger";
import TelegramBot, { Message } from "node-telegram-bot-api";
import { Cache } from "types";

const MIN_IMAGES_COUNT = 5;
const MAX_IMAGES_COUNT = 15;

interface PhotoListener {
	bot: TelegramBot,
	cache: Cache,
	message: Message,
}
const photoListener = async ({ bot, cache, message }: PhotoListener) => {
	const { from, photo } = message;
	const { id, is_bot, username = "anonymous" } = from;

	if (is_bot) return;

	try {
		const maxSizeFile = photo.at(-1);

		const photoLink = await bot.getFileLink(maxSizeFile.file_id);

		if (!cache[id] || cache[id].links.length < MAX_IMAGES_COUNT) {
			cache[id] = {
				links: (cache[id]?.links || []).concat([photoLink]),
			};
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
			message: `Error, F from ${id} ${username}, ${error} ${cache[id]?.links.join(",")}`,
		});
	}
};

export { photoListener };
