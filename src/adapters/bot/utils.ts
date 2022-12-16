import TelegramBot, { Document } from "node-telegram-bot-api";

export const getDocumentLink = async (bot: TelegramBot, document: Document) => {
	const result = await bot.getFileLink(document.file_id);
    
	return result;
};
