import TelegramBotApi from "node-telegram-bot-api";

import initListeners from "./listeners";

import { UsersImagesLinks } from "../../../types";
import { ExternalServices } from "../../externals";

const BOT_TOKEN = process.env.BOT_TOKEN;

interface initTelegramBot {
	externals?: ExternalServices,
	repository?: UsersImagesLinks
}

const initTelegramBot = ({ repository = {}, externals }: initTelegramBot) => {
	const bot = new TelegramBotApi(BOT_TOKEN, { polling: true });

	bot.setMyCommands([
		{ command: "/start", description: "Начать" },
		{ command: "/help", description: "Помощь" },
		{ command: "/clear", description: "Сбросить загруженное" },
	]);

	bot.sendMessage(1408833695, "Добрый день!\nВозникли небольшие неполадки, сделали возврат средств!\nПроблему решили, можете попробовать еще раз!");
	bot.sendMessage(808509780, "Добрый день!\nВозникли небольшие неполадки, сделали возврат средств!\nПроблему решили, можете попробовать еще раз!");

	initListeners({ bot, repository, externals });

	return bot;
};

export { initTelegramBot };
