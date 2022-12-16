import { createTune } from "../astria/create-tune";
import { t } from "i18next";

import TelegramBotApi from "node-telegram-bot-api";
import { getDocumentLink } from "./utils";

const BOT_TOKEN = process.env.BOT_TOKEN;
const YOOMONEY_TOKEN = process.env.YOOMONEY_TOKEN;
const MIN_IMAGES_COUNT = 10;
const MAX_IMAGES_COUNT = 30;

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
			console.log("Pre_checkout_query=", query);

			if (!usersImagesLinks[id]) {
				await bot.answerPreCheckoutQuery(query.id, false, { error_message: "Этот заказ уже оплачен. Чтобы заказать еще больше стильных аватарок, загрузите новые фотографии!" });
				return;
			}
			await bot.answerPreCheckoutQuery(query.id, true);
		} catch (error) {
			console.log("Error: ", error);
			await bot.answerPreCheckoutQuery(query.id, false, { error_message: "Что-то пошло не так!" });
		}
	});

	bot.on("callback_query", async (query) => {
		const { id: queryId, from, data } = query;
		const { id } = from;
		console.log("Callback_query=", query);

		if (!usersImagesLinks[id]) {
			await bot.sendMessage(id, "Чтобы заказать еще больше стильных аватарок, загрузите новые фотографии!");
			return;
		}

		if (data === "woman" || data === "man") {
			usersImagesLinks[id] = Object.assign(usersImagesLinks[id], { sex: data as Sex });

			// TODO: editMessageReplyMarkup
			await bot.sendMessage(
				id,
				"Сколько аватарок рисуем?",
				{
					reply_markup: {
						inline_keyboard: [
							[{ text: "240 аватарок/30 стилей = 799 ₽", callback_data: "payment-1" }],
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
				"Аватарки 240/30",
				"Оплата 240 аватарок в 30 разных стилях",
				"Payload",
				YOOMONEY_TOKEN,
				"RUB",
				[{ "amount": 79900, "label": "Руб" }]
			);

			await bot.answerCallbackQuery(queryId);
		}
	});

	bot.on("message", async (message) => {
		try {
			const { text, from, photo, document, successful_payment } = message;
			const { language_code: lng, is_bot, id, username } = from;

			console.log("Message=", message);

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
				if (!usersImagesLinks[id]) {
					await bot.sendMessage(
						id,
						"Пришлите фотографии, чтобы их затюнить!"
					);
					return;
				}
				if (!usersImagesLinks[id].links.length) {
					await bot.sendMessage(
						id,
						"Пришлите фотографии, чтобы их затюнить!"
					);
					return;
				}
				// TODO: editMessageReplyMarkup
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
						`Классные фотографии, уже можно посылать на обработку /draw, а можно добавить больше фотографий, еще ${MAX_IMAGES_COUNT - usersImagesLinks[id].links.length}!`
					);
				}
				return;
			}

			if (successful_payment) {
				console.log("Successful_payment=");
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
