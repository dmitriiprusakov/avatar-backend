import { ExternalServices } from "adapters/externals";
import TelegramBot, { Message } from "node-telegram-bot-api";
import { Cache } from "types";
import { Logger } from "winston";

import { Payload } from "../callback-query/payments-config";

interface SuccessfulPaymentListener {
	bot: TelegramBot;
	message: Message;
	cache: Cache;
	externals: ExternalServices;
	logger: Logger;
}

const successfulPaymentListener = async ({ bot, message, cache, externals, logger }: SuccessfulPaymentListener) => {
	try {
		const { from, successful_payment } = message;
		const { is_bot, id, username = "anonymous" } = from;

		if (is_bot) return;

		if (successful_payment) {
			try {
				const invoice_payload: Payload = JSON.parse(successful_payment.invoice_payload);

				await bot.sendMessage(id, "Фото отправляются на обработку...");

				await externals.astria.createTune({
					chatId: id,
					image_urls: cache[id].links,
					name: cache[id].sex,
					username,
					promptsAmount: invoice_payload.promptsAmount,
					logger,
				});

				await bot.sendMessage(id, "✨ Фото отправлены на обработку, примерное время ожидания 1 час!");
				delete cache[id];

				logger.log({
					level: "info",
					message: `S_P from ${id} ${username}`,
				});

				return;
			} catch (error) {
				logger.log({
					level: "error",
					message: `Error, S_P from ${id} ${username}, ${error}`,
				});
			}
		}
	} catch (error) {
		logger.log({
			level: "error",
			message: `Global Error M, ${error}`,
		});
	}
};

export { successfulPaymentListener };
