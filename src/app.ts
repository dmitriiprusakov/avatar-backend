import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";

import { initTelegramBot } from "./adapters/bot/telegram";
import initRoutes from "./ports/http";
import "./libs/i18next";

import { UsersImagesLinks } from "./types";
import { initExternalServices } from "./adapters/externals";

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
			console.log("We are live on " + PORT);
			console.log("IS_TESTING_BRANCH", IS_TESTING_BRANCH, !!IS_TESTING_BRANCH);

			const externals = initExternalServices();

			const bot = initTelegramBot({ repository, externals });

			initRoutes(app, bot);
		});
	} catch (error) {
		console.log("ERROR EXECUTED: ", error);
	}
}

main();

export default app;
