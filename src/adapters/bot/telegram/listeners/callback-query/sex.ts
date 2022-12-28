import TelegramBot, { CallbackQuery, InlineKeyboardButton } from "node-telegram-bot-api";
import { Cache, Sex } from "types";
import { Logger } from "winston";

import { payments } from "./payments-config";

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

interface SexQueryParams {
	bot: TelegramBot,
	query: CallbackQuery,
	cache: Cache,
	logger: Logger;
}
export const sexQueryHandler = async ({ bot, query, cache, logger }: SexQueryParams) => {
	const { id: queryId, from, data } = query;
	const { id, username = "anonymous" } = from;

	const [queryType, queryValue] = data.split("/");

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
			message: `Error, sex C_Q from ${id} ${username}, Q_T ${queryType}, Q_V ${queryValue}, ${error}`,
		});
		await bot.answerCallbackQuery(queryId);
	}
};
