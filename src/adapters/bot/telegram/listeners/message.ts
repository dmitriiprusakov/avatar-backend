import TelegramBot, { InputMedia, Message } from "node-telegram-bot-api";
import { t } from "i18next";

import { UsersImagesLinks } from "../../../../types";
import { ExternalServices } from "../../../externals";
import { logger } from "../../../../logger";

const MIN_IMAGES_COUNT = 10;
const MAX_IMAGES_COUNT = 30;

interface MessageListener {
	bot: TelegramBot,
	message: Message,
	repository: UsersImagesLinks,
	externals: ExternalServices
}

const messageListener = async ({ bot, message, repository, externals }: MessageListener) => {
	try {
		const { text, from, photo, document, successful_payment } = message;
		const { is_bot, id, username } = from;

		if (is_bot) return;

		if (text === "/start") {
			try {
				const media = [
					"https://www.dropbox.com/s/qjy2kzl2lpy6qj2/Group%2039%20%281%29.png?dl=0",
					"https://www.dropbox.com/s/2t416n8zapt42gz/Group%2042.png?dl=0",
				].map<InputMedia>((imageUrl, index) => ({
					type: "photo",
					media: imageUrl,
					caption: index === 0 ? t("welcome", { lng: "ru" }) : undefined,
				}));

				await bot.sendMediaGroup(id, media);

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
				return;
			} catch (error) {
				logger.log({
					level: "error",
					message: `Error, C /help from ${id} ${username}, ${error}`,
				});
			}
		}

		if (text === "/draw") {
			try {
				if (!repository[id]?.links?.length) {
					await bot.sendMessage(
						id,
						"Пришлите фотографии, чтобы их затюнить!"
					);
					return;
				}

				if (!repository[id].sex) {
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

				repository[id] = {
					links: (repository[id]?.links || []).concat([photoLink]),
				};

				if (repository[id].links.length < MIN_IMAGES_COUNT) {
					bot.sendMessage(
						id,
						`Отличная фотка, но нужно еще ${MIN_IMAGES_COUNT - repository[id].links.length}!`
					);
				} else {
					bot.sendMessage(
						id,
						`Классные фотографии, уже можно посылать на обработку /draw, а можно добавить больше фотографий, еще ${MAX_IMAGES_COUNT - repository[id].links.length}!`
					);
				}
				return;
			} catch (error) {
				logger.log({
					level: "error",
					message: `Error, F from ${id} ${username}, ${error} ${repository[id]?.links.join(",")}`,
				});
			}

		}

		if (document) {
			try {
				const documentLink = await bot.getFileLink(document.file_id);

				repository[id] = {
					links: (repository[id]?.links || []).concat([documentLink]),
				};

				if (repository[id].links.length < MIN_IMAGES_COUNT) {
					bot.sendMessage(
						id,
						`Отличная фотка, но нужно еще ${MIN_IMAGES_COUNT - repository[id].links.length}!`
					);
				} else {
					bot.sendMessage(
						id,
						`Классные фотографии, уже можно посылать на обработку /draw, а можно добавить больше фотографий, еще ${MAX_IMAGES_COUNT - repository[id].links.length}!`
					);
				}
				return;
			} catch (error) {
				logger.log({
					level: "error",
					message: `Error, D from ${id} ${username}, ${error} ${repository[id]?.links.join(",")}`,
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
					image_urls: repository[id].links,
					name: repository[id].sex,
					username,
					promptsAmount: successful_payment.invoice_payload,
				});

				await bot.sendMessage(id, "Фото отправлены на обработку, примерное время ожидания 1 час!");
				delete repository[id];

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
