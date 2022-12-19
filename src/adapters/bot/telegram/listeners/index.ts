import { ExternalServices } from "../../../externals";
import TelegramBot from "node-telegram-bot-api";

import { callbackQueryListener } from "./callback-query";
import { messageListener } from "./message";
import { preCheckoutQueryListener } from "./pre-checkout-query";
import { UsersImagesLinks } from "../../../../types";

interface InitListeners {
	bot: TelegramBot,
	repository: UsersImagesLinks,
	externals?: ExternalServices
}

const initListeners = ({ bot, repository, externals }: InitListeners) => {
	bot.on(
		"pre_checkout_query",
		(query) => preCheckoutQueryListener({ bot, query, repository })
	);
	bot.on(
		"callback_query",
		(query) => callbackQueryListener({ bot, query, repository })
	);
	bot.on(
		"message",
		(message) => messageListener({ bot, message, repository, externals })
	);
};

export default initListeners;
