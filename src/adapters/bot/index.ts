import { createTune } from "../astria/create-tune";
import { t } from "i18next";

import TelegramBotApi from "node-telegram-bot-api";
import { getDocumentLink } from "./utils";

const BOT_TOKEN = process.env.BOT_TOKEN;
const YOOMONEY_TOKEN = process.env.YOOMONEY_TOKEN;
const MIN_IMAGES_COUNT = 5;
const MAX_IMAGES_COUNT = 20;

type Sex = "man" | "woman"
type UserData = {
	sex?: Sex,
	links?: string[],
}

type UsersImagesLinks = Record<number, UserData>

const usersImagesLinks: UsersImagesLinks = {};

const initBot = () => {
	const bot = new TelegramBotApi(BOT_TOKEN, { polling: true });

	bot.setMyCommands([
		{ command: "/start", description: "Начать" },
		{ command: "/help", description: "Помощь" },
	]);

	bot.on("pre_checkout_query", async (query) => {
		try {
			const { from } = query;
			const { id } = from;

			if (!usersImagesLinks[id]) {
				await bot.answerPreCheckoutQuery(query.id, false, { error_message: "Чтобы заказать еще больше стильных аватарок, загрузите новые фотографии!" });
				return;
			}
			await bot.answerPreCheckoutQuery(query.id, true);
		} catch (error) {
			console.log("Error: ", error);
			await bot.answerPreCheckoutQuery(query.id, false, { error_message: "Something went wrong" });
		}
	});

	bot.on("callback_query", async (query) => {
		const { id: queryId, from, data } = query;
		const { id } = from;

		if (data === "woman" || data === "man") {
			if (!usersImagesLinks[id]) {
				await bot.sendMessage(query.id, "Чтобы заказать еще больше стильных аватарок, загрузите новые фотографии!");
				await bot.answerCallbackQuery(queryId, { text: "Чтобы заказать еще больше стильных аватарок, загрузите новые фотографии!" });
			}

			usersImagesLinks[id] = Object.assign(usersImagesLinks[id], { sex: data as Sex });

			await bot.sendMessage(
				id,
				"Сколько аватарок рисуем?",
				{
					reply_markup: {
						inline_keyboard: [
							[{ text: "80 аватарок/10 стилей = 299 ₽", callback_data: "payment-1" }],
							// [{ text: "160 аватарок/20 стилей = 599 ₽", callback_data: "payment-2" }],
						],
					},
				}
			);
			await bot.answerCallbackQuery(queryId);
			return;
		}

		if (data === "payment-1" || data === "payment-2") {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			await bot.sendInvoice(
				id,
				"Аватарки 80/10",
				"Оплата стилизации 80 аватарок в 10 разных стилях",
				"Payload",
				YOOMONEY_TOKEN,
				"RUB",
				[{ "amount": 29900, "label": "Руб" }]
			);

			await bot.answerCallbackQuery(queryId);
		}
	});

	bot.on("message", async (message) => {
		try {
			const { text, from, photo, document, successful_payment } = message;
			const { language_code: lng, is_bot, id, username } = from;

			if (is_bot) return;

			if (text === "/start") {
				await bot.sendMessage(id, t("welcome", { lng }));
				return;
			}

			if (text === "/help") {
				await bot.sendMessage(id, t("welcome", { lng }));
				return;
			}

			if (text === "/tune") {
				if (!usersImagesLinks[id]) return;
				if (!usersImagesLinks[id].links.length) {
					await bot.sendMessage(
						id,
						"Пришлите фотографии, чтобы их затюнить!"
					);
					return;
				}
				if (!usersImagesLinks[id].sex) {
					await bot.sendMessage(
						id,
						"Кто на выбранных фотографиях?",
						{
							reply_markup: {
								inline_keyboard: [
									[{ text: "Женщина", callback_data: "woman" }],
									[{ text: "Мужчина", callback_data: "man" }],
								],
							},
						}
					);
					return;
				}
				return;
			}

			if (photo && photo.length) {
				bot.sendMessage(
					id,
					"Лучше прикрепите фотографии как документы, чтобы не потерять качество!"
				);
				return;
			}

			if (document) {
				const documentLink = await getDocumentLink(bot, document);

				usersImagesLinks[id] = {
					links: (usersImagesLinks[id]?.links || []).concat([documentLink]),
				};

				if (usersImagesLinks[id].links.length < MIN_IMAGES_COUNT) {
					bot.sendMessage(
						id,
						`Отличная фотка, но нужно еще ${MIN_IMAGES_COUNT - usersImagesLinks[id].links.length}!`
					);
				} else {
					bot.sendMessage(
						id,
						`Классная фотка, можно уже посылать на обработку /tune, а можно добить до максимума, еще ${MAX_IMAGES_COUNT - usersImagesLinks[id].links.length}!`
					);
				}
				return;
			}

			if (successful_payment) {
				await createTune(id, usersImagesLinks[id].links, usersImagesLinks[id].sex, username);
				await bot.sendMessage(id, "Фото отправлены на обработку, примерное время ожидания 1 час!");
				delete usersImagesLinks[id];
				return;
			}

			bot.sendMessage(id, "Не совсем понял, что вы имеете ввиду!");
		} catch (error) {
			console.error("Error!:", error);
		}
	});

	return bot;
};

export { initBot };
