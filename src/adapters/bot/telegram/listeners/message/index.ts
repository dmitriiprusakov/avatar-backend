import TelegramBot, { Message } from "node-telegram-bot-api";

import { ExternalServices } from "../../../../externals";
import { logger } from "../../../../../logger";
import { FirestoreRepository } from "../../../../../adapters/repository";
import { Cache, MessagesCache } from "../../../../../types";
import { startHandler } from "./start";
import { helpHandler } from "./help";
import { clearHandler } from "./clear";
import { drawHandler } from "./draw";

const MIN_IMAGES_COUNT = 5;
const MAX_IMAGES_COUNT = 15;

interface MessageListener {
	bot: TelegramBot,
	message: Message,
	cache: Cache,
	messagesCache: MessagesCache,
	repository: FirestoreRepository,
	externals: ExternalServices
}

const messageListener = async ({ bot, message, cache, messagesCache, repository, externals }: MessageListener) => {
	try {
		const { text, from, photo, document } = message;
		const { is_bot, id, username = "anonymous" } = from;

		if (is_bot) return;

		if (text === "/start") return startHandler({ bot, repository, message });

		if (text === "/help") return helpHandler({ bot, message });

		if (text === "/clear") return clearHandler({ bot, message, cache });

		if (text === "/draw") return drawHandler({ bot, message, cache });

		if (photo && photo.length) {
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

		}

		if (document) {
			try {
				const documentLink = await bot.getFileLink(document.file_id);

				if (!cache[id] || cache[id].links.length < MAX_IMAGES_COUNT) {
					cache[id] = {
						links: (cache[id]?.links || []).concat([documentLink]),
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
					message: `Error, D from ${id} ${username}, ${error} ${cache[id]?.links.join(",")}`,
				});
			}
		}

		await bot.sendMessage(id, "Не совсем понял, что вы имеете ввиду!");
	} catch (error) {
		logger.log({
			level: "error",
			message: `Global Error M, ${error}`,
		});
	}
};

export { messageListener };
