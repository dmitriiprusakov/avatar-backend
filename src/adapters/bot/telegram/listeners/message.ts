import TelegramBot, { InputMedia, Message } from "node-telegram-bot-api";
import { t } from "i18next";

import { ExternalServices } from "../../../externals";
import { logger } from "../../../../logger";
import { FirestoreRepository } from "../../../../adapters/repository";
import { UsersImagesLinks } from "../../../../types";

const MIN_IMAGES_COUNT = 10;
const MAX_IMAGES_COUNT = 30;

interface MessageListener {
	bot: TelegramBot,
	message: Message,
	cache: UsersImagesLinks,
	repository: FirestoreRepository,
	externals: ExternalServices
}

const messageListener = async ({ bot, message, cache, repository, externals }: MessageListener) => {
	try {
		const { text, from, photo, document, successful_payment } = message;
		const { is_bot, id, username = "anonymous" } = from;

		if (is_bot) return;

		if (text === "/start") {
			try {
				const media = [
					"https://www.dropbox.com/s/docz6jphy7dki10/examples_gallery.png?dl=0",
					"https://www.dropbox.com/s/dd4qgvvcz11y8m4/recommended.png?dl=0",
					"https://www.dropbox.com/s/56zzg8b70yrx2ra/not_recommended.png?dl=0",
				].map<InputMedia>((imageUrl, index) => ({
					type: "photo",
					media: imageUrl,
					caption: index === 0 ? t("welcome", { lng: "ru" }) : undefined,
				}));

				await bot.sendMediaGroup(id, media);

				repository.AddUser({ id, username });

				logger.log({
					level: "info",
					message: `C /start from ${id} ${username}`,
				});

				return;
			} catch (error) {
				logger.log({
					level: "error",
					message: `Error, C /start from ${id} ${username}, ${error}`,
				});
			}
		}

		if (text === "/help") {
			try {
				await bot.sendMessage(id, t("help", { lng: "ru" }));

				logger.log({
					level: "info",
					message: `C /help from ${id} ${username}`,
				});

				return;
			} catch (error) {
				logger.log({
					level: "error",
					message: `Error, C /help from ${id} ${username}, ${error}`,
				});
			}
		}

		if (text === "/clear") {
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
		}

		if (text === "/draw") {
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
		}

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

		if (successful_payment) {
			try {
				logger.log({
					level: "info",
					message: `S_P from ${id} ${username}`,
				});

				await externals.astria.createTune({
					chatId: id,
					image_urls: cache[id].links,
					name: cache[id].sex,
					username,
					promptsAmount: successful_payment.invoice_payload,
				});

				await bot.sendMessage(id, "Фото отправлены на обработку, примерное время ожидания 1 час!");
				delete cache[id];

				return;
			} catch (error) {
				logger.log({
					level: "error",
					message: `Error, S_P from ${id} ${username}, ${error}`,
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
