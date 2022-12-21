import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";

import "./libs/i18next";
import { initTelegramBot } from "./adapters/bot/telegram";
import initRoutes from "./ports/http";
import { UsersImagesLinks } from "./types";
import { initExternalServices } from "./adapters/externals";
import { logger } from "./logger";

const PORT = process.env.PORT || 8080;
const IS_TESTING_BRANCH = process.env.IS_TESTING_BRANCH;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function main() {
	try {
		const server = http.createServer(app);

		const repository: UsersImagesLinks = {};

		server.listen(PORT, () => {
			logger.log({
				level: "info",
				message: `We are live on ${PORT}, IS_TESTING_BRANCH = ${!!IS_TESTING_BRANCH}`,
			});

			const externals = initExternalServices();

			const bot = initTelegramBot({ repository, externals });

			// bot.sendMessage(808509780, "")

			initRoutes(app, bot);
		});
	} catch (error) {
		logger.log({
			level: "error",
			message: `Global Error, ${error}`,
		});
	}
}

main();

export default app;
