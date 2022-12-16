
import i18next from "i18next";
import FsBackend from "i18next-fs-backend";
import path from "path";

i18next
	.use(FsBackend)
	.init({
		debug: process.env.DEBUG_I18NEXT === "true",

		fallbackLng: "en",
		lng: "en",
		preload: ["en", "ru"],
		
		backend: {
			loadPath: path.resolve(__dirname, "../locales/{{lng}}/{{ns}}.json"),
			// requestOptions: {
			// 	cache: "no-store",
			// },
		},
	});

export default i18next;
