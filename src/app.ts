import "./common/i18n";
import "./libs/dotenv";

import express from "express";
import http from "http";

import { initTelegramBot } from "./adapters/bot/telegram";
import { initExternalServices } from "./adapters/externals";
import { FirestoreRepository } from "./adapters/repository";
import initLogger from "./logger";
import initRoutes from "./ports/http";
import { Cache, MessagesCache } from "./types";

const PORT = process.env.PORT || 8080;
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
		logger.log({
			level: "info",
			message: `We are live on ${PORT}, ASTRIA_IS_FAST_BRANCH = ${!!ASTRIA_IS_FAST_BRANCH}`,
		});

		const repository = new FirestoreRepository({ logger });

		const externals = initExternalServices();

		const bot = initTelegramBot({ logger, cache, messagesCache, repository, externals });

		initRoutes({ app, bot, logger });
	});
}

main();

export default app;
