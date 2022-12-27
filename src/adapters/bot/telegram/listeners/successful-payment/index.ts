import TelegramBot, { Message } from "node-telegram-bot-api";

import { ExternalServices } from "../../../../externals";
import { logger } from "../../../../../logger";
import { Cache } from "../../../../../types";

interface SuccessfulPaymentListener {
	bot: TelegramBot,
	message: Message,
	cache: Cache,
	externals: ExternalServices
}

const successfulPaymentListener = async ({ bot, message, cache, externals }: SuccessfulPaymentListener) => {
	try {
		const { from, successful_payment } = message;
		const { is_bot, id, username = "anonymous" } = from;

		if (is_bot) return;

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
	} catch (error) {
		logger.log({
			level: "error",
			message: `Global Error M, ${error}`,
		});
	}
};

export { successfulPaymentListener };
