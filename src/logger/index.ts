import { createLogger, format, transports } from "winston";

const initLogger = () => {
	const { combine, timestamp, printf } = format;

	const formatter = printf(({ level, message, timestamp }) => {
		return `${timestamp} [${level}]: ${message}`;
	});

	const logger = createLogger({
		format: combine(
			timestamp(),
			formatter
		),
		transports: [
			new transports.File({ filename: "combined.log" }),
		],
	});

	if (!!process.env.LOGGER_TO_CONSOLE) {
		logger.add(new transports.Console({
			format: format.simple(),
		}));
	}

	return logger;
};

export default initLogger;
