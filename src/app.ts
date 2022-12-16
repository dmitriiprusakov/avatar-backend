import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";

import { initBot } from "./adapters/bot";
import initRoutes from "./ports";
import "./libs/i18next";

const PORT = process.env.PORT || 8080;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function main() {
	try {
		const server = http.createServer(app);

		server.listen(PORT, () => {
			console.log("We are live on " + PORT);

			const bot = initBot();
			initRoutes(app, bot);
		});
	} catch (error) {
		console.log("ERROR EXECUTED: ", error);
	}
}

main();

export default app;
