import TelegramBot, { Message } from "node-telegram-bot-api";
import { t } from "i18next";

import { UsersImagesLinks } from "../../../../types";
import { ExternalServices } from "../../../externals";

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

		// console.log("Message=", message);

		if (is_bot) return;

		if (text === "/start") {
			await bot.sendMessage(id, t("welcome", { lng: "ru" }));
			return;
		}

		if (text === "/help") {
			await bot.sendMessage(id, t("help", { lng: "ru" }));

			return;
		}

		if (text === "/draw") {
			if (!repository[id] || !repository[id].links.length) {
				await bot.sendMessage(
					id,
					"Пришлите фотографии, чтобы их затюнить!"
				);
				return;
			}
			// TODO: editMessageReplyMarkup
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
				return;
			}
			return;
		}

		if (photo && photo.length) {
			console.log({ photo });

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
		}

		if (document) {
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
		}

		if (successful_payment) {
			console.log("Successful_payment=", successful_payment);
			const { invoice_payload } = successful_payment;
			await externals.astria.createTune({
				chatId: id,
				image_urls: repository[id].links,
				name: repository[id].sex,
				username,
				promptsAmount: invoice_payload,
			});
			await bot.sendMessage(id, "Фото отправлены на обработку, примерное время ожидания 1 час!");
			delete repository[id];
			return;
		}

		bot.sendMessage(id, "Не совсем понял, что вы имеете ввиду!");
	} catch (error) {
		console.error("Error!:", error);
	}
};

export { messageListener };
