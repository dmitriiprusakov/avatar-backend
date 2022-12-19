import axios from "axios";

import { createTune } from "./create-tune";
import { Astria } from "./types";

const ASTRIA_API_TOKEN = process.env.ASTRIA_API_TOKEN;
const ASTRIA_API_DOMAIN = process.env.ASTRIA_API_DOMAIN;

export const axiosAstria = axios.create({
	baseURL: ASTRIA_API_DOMAIN,
	headers: {
		"Authorization": `Bearer ${ASTRIA_API_TOKEN}`,
		"Content-Type": "application/json",
	},
});

const initAstriaService = (): Astria => {
	if (!ASTRIA_API_TOKEN) throw new Error("No Astria api token provided");
	if (!ASTRIA_API_DOMAIN) throw new Error("No Astria api domain provided");

	return {
		createTune,
	};
};

export * from "./types";
export default initAstriaService;
