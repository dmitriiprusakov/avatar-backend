/* eslint-disable @typescript-eslint/ban-ts-comment */
import { logger } from "../../../../logger";
import TelegramBot, { CallbackQuery, InlineKeyboardButton } from "node-telegram-bot-api";
import { Cache, Sex } from "../../../../types";
import { v4 as uuidv4 } from "uuid";

const YOOMONEY_TOKEN = process.env.YOOMONEY_TOKEN;

type Price = {
	amount: number;
	label: string;
}

type Payment = {
	title: string;
	description: string;
	text: string;
	payload: string;
	prices: Price[];
}

type Payments = Record<string, Payment>
const payments: Payments = {
	"1": {
		"title": "Аватарки 80/10",
		"description": "Оплата 80 аватарок в 10 разных стилях",
		"text": "80 аватарок/10 стилей = 299 ₽",
		"payload": "10",
		"prices": [{ "amount": 29900, "label": "RUB" }],
	},
	"2": {
		"title": "Аватарки 160/20",
		"description": "Оплата 160 аватарок в 20 разных стилях",
		"text": "160 аватарок/20 стилей = 599 ₽",
		"payload": "20",
		"prices": [{ "amount": 59900, "label": "RUB" }],
	},
	"3": {
		"title": "Аватарки 240/30",
		"description": "Оплата 240 аватарок в 30 разных стилях",
		"text": "240 аватарок/30 стилей = 799 ₽",
		"payload": "30",
		"prices": [{ "amount": 79900, "label": "RUB" }],
	},
};

type PaymentsConfig = {
	callback_data_ids: string[];
	inline_keyboard: InlineKeyboardButton[][];
}

const paymentsConfig = Object.keys(payments)
	.reduce<PaymentsConfig>((acc, paymentId) => {
		const payment = payments[paymentId];
		return {
			callback_data_ids: acc.callback_data_ids.concat([paymentId]),
			inline_keyboard: acc.inline_keyboard.concat([[{
				text: payment.text,
				callback_data: `payment/${paymentId}`,
			}]]),
		};
	}, {
		callback_data_ids: [],
		inline_keyboard: [],
	});

type CallbackQueryListener = {
	bot: TelegramBot;
	query: CallbackQuery;
	cache: Cache;
}

const callbackQueryListener = async ({ bot, query, cache }: CallbackQueryListener) => {
	try {
		const { id: queryId, from, data } = query;
		const { id, is_bot, username = "anonymous" } = from;

		if (is_bot) return;

		const [queryType, queryValue] = data.split("/");

		if (!cache[id]) {
			try {
				await bot.sendMessage(id, "Чтобы заказать еще больше стильных аватарок, загрузите новые фотографии!");
				await bot.answerCallbackQuery(queryId);

				return;
			} catch (error) {
				logger.log({
					level: "error",
					message: `Error, C_Q from ${id} ${username}, ${error}`,
				});
				await bot.answerCallbackQuery(queryId);
			}
		}

		if (queryType === "sex") {
			try {
				if (!cache[id].sex) {
					await bot.sendMessage(
						id,
						"Сколько аватарок рисуем?",
						{
							reply_markup: {
								inline_keyboard: paymentsConfig.inline_keyboard,
							},
						}
					);
				}

				cache[id] = Object.assign(cache[id], { sex: queryValue as Sex });

				await bot.answerCallbackQuery(queryId);
				return;
			} catch (error) {
				logger.log({
					level: "error",
					message: `Error, C_Q from ${id} ${username}, Q_T ${queryType}, Q_V ${queryValue}, ${error}`,
				});
				await bot.answerCallbackQuery(queryId);
			}
		}

		if (queryType === "payment") {
			// FIXME: перед высылкой инвойса нужно чекнуть, что все данные есть, пол, фотки
			try {
				const selectedPayment = payments[queryValue];
				// @ts-ignore
				const mess = await bot.sendInvoice(
					id,
					selectedPayment.title,
					selectedPayment.description,
					selectedPayment.payload,
					YOOMONEY_TOKEN,
					"RUB",
					// @ts-ignore
					selectedPayment.prices,
					{
						start_parameter: uuidv4(),
					}
				);
				console.log("payment mess=", mess);

				await bot.answerCallbackQuery(queryId);
			} catch (error) {
				logger.log({
					level: "error",
					message: `Error, C_Q from ${id} ${username}, Q_T ${queryType}, Q_V ${queryValue}, ${error}`,
				});
				await bot.answerCallbackQuery(queryId);
			}
		}
	} catch (error) {
		logger.log({
			level: "error",
			message: `Global Error C_Q , ${error}`,
		});
	}
};

export { callbackQueryListener };
