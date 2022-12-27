
import i18next from "i18next";
import FsBackend from "i18next-fs-backend";
import path from "path";

i18next
	.use(FsBackend)
	.init({
		debug: process.env.DEBUG_I18NEXT === "true",

		initImmediate: false,

		fallbackLng: "en",
		lng: "en",
		preload: ["en", "ru"],

		backend: {
			loadPath: path.resolve(__dirname, "../../resources/locales/{{lng}}/{{ns}}.json"),
		},
	});

export default i18next;
