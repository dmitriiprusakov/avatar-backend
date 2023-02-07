import "./common/i18n";
import "./libs/dotenv";

import express from "express";
import http from "http";

import { initTelegramBot } from "./adapters/bot/telegram";
import { initVkontakteBot } from "./adapters/bot/vkontakte";
import { initExternalServices } from "./adapters/externals";
import { FirestoreRepository } from "./adapters/repository";
import initLogger from "./logger";
import initRoutes from "./ports/http";
import { Cache, MessagesCache } from "./types";

const PORT = process.env.PORT || 8080;
const BOT_TO_RUN = process.env.BOT_TO_RUN;
const ASTRIA_IS_FAST_BRANCH = process.env.ASTRIA_IS_FAST_BRANCH;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function main() {
	const logger = initLogger();

	const cache: Cache = {};

	const messagesCache: MessagesCache = {};

	const server = http.createServer(app);

	server.listen(PORT, () => {
		const repository = new FirestoreRepository({ logger });

		const externals = initExternalServices();

		switch (BOT_TO_RUN) {
			case "telegram":
				const telegramBot = initTelegramBot({ logger, cache, messagesCache, repository, externals });

				initRoutes({ app, bot: telegramBot, logger });
				break;
			case "vkontakte":
				const vkontakteBot = initVkontakteBot({ logger, cache, messagesCache, repository, externals });

				break;
			default:
				throw new Error("NO VALID BOT_TO_RUN ENV PROVIDED!");
		}

		logger.log({
			level: "info",
			message: `We are live on ${PORT}, BOT_TO_RUN = ${BOT_TO_RUN}, ASTRIA_IS_FAST_BRANCH = ${!!ASTRIA_IS_FAST_BRANCH}`,
		});
	});
}

main();

export default app;
