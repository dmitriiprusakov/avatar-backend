import axios from "axios";

const ASTRIA_API_TOKEN = process.env.ASTRIA_API_TOKEN;
const ASTRIA_API_DOMAIN = process.env.ASTRIA_API_DOMAIN;

export const axiosAstria = axios.create({
	baseURL: ASTRIA_API_DOMAIN,
	headers: {
		"Authorization": `Bearer ${ASTRIA_API_TOKEN}`,
		"Content-Type": "application/json",
	},
});
