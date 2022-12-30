import { t } from "i18next";
import TelegramBot, { CallbackQuery, InlineKeyboardButton } from "node-telegram-bot-api";
import { Cache, MessagesCache, Sex } from "types";
import { Logger } from "winston";

import { payments } from "./payments-config";

type PaymentsConfig = {
	inline_keyboard: InlineKeyboardButton[][];
}

const paymentsConfig = Object.keys(payments)
	.reduce<PaymentsConfig>((acc, paymentId) => {
		const payment = payments[paymentId];
		return {
			inline_keyboard: acc.inline_keyboard.concat([[{
				text: payment.text,
				callback_data: `payment/${paymentId}`,
			}]]),
		};
	}, {
		inline_keyboard: [],
	});

interface SexQueryParams {
	bot: TelegramBot,
	query: CallbackQuery,
	cache: Cache,
	messagesCache: MessagesCache,
	logger: Logger;
}
export const sexQueryHandler = async ({ bot, query, cache, messagesCache, logger }: SexQueryParams) => {
	const { id: queryId, from, data } = query;
	const { id, username = "anonymous" } = from;

	const [queryType, queryValue] = data.split("/");

	try {
		cache[id] = Object.assign(cache[id] || {}, { sex: queryValue as Sex });

		if (messagesCache[id]?.chooseSexMessageId) {
			await bot.editMessageText(
				`Кто на выбранных фотографиях?\n➪ _*${t(`sex.${queryValue}`, { lng: "ru" })}*_`,
				{
					chat_id: id,
					message_id: messagesCache[id].chooseSexMessageId,
					parse_mode: "MarkdownV2",
				}
			);
			delete messagesCache[id].chooseSexMessageId;
			await bot.answerCallbackQuery(queryId);
		}

		setTimeout(async () => {
			const { message_id } = await bot.sendMessage(
				id,
				"Сколько аватарок рисуем? Скидки от 20 до 30% 🎁",
				{
					reply_markup: {
						inline_keyboard: paymentsConfig.inline_keyboard,
					},
					parse_mode: "MarkdownV2",
				}
			);

			messagesCache[id] = Object.assign(
				messagesCache[id] || {},
				{ choosePayOptionMessageId: message_id }
			);
		}, 300);
	} catch (error) {
		logger.log({
			level: "error",
			message: `Error, sex C_Q from ${id} ${username}, Q_T ${queryType}, Q_V ${queryValue}, ${error}`,
		});
		await bot.answerCallbackQuery(queryId);
	}
};
