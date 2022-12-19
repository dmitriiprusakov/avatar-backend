/* eslint-disable @typescript-eslint/no-explicit-any */
import TelegramBot, { CallbackQuery, InlineKeyboardButton } from "node-telegram-bot-api";
import { Sex, UsersImagesLinks } from "../../../../types";

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
	repository: UsersImagesLinks;
}

// TODO: editMessageReplyMarkup
const callbackQueryListener = async ({ bot, query, repository }: CallbackQueryListener) => {
	try {
		const { id: queryId, from, data } = query;
		const { id } = from;
		console.log("Callback_query=", query);
		console.log("paymentsConfig.inline_keyboard=", paymentsConfig.inline_keyboard);

		const [queryType, queryValue] = data.split("/");

		if (!repository[id]) {
			await bot.sendMessage(id, "Чтобы заказать еще больше стильных аватарок, загрузите новые фотографии!");
			return;
		}

		if (queryType === "sex") {
			repository[id] = Object.assign(repository[id], { sex: queryValue as Sex });

			await bot.sendMessage(
				id,
				"Сколько аватарок рисуем?",
				{
					reply_markup: {
						inline_keyboard: paymentsConfig.inline_keyboard,
					},
				}
			);
			await bot.answerCallbackQuery(queryId);
			return;
		}

		if (queryType === "payment") {
			const selectedPayment = payments[queryValue];
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			await bot.sendInvoice(
				id,
				selectedPayment.title,
				selectedPayment.description,
				selectedPayment.payload,
				YOOMONEY_TOKEN,
				"RUB",
				selectedPayment.prices
			);

			await bot.answerCallbackQuery(queryId);
		}
	} catch (error) {
		console.log("Error, callback query: ", error);
	}
};

export { callbackQueryListener };
