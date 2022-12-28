import initAstriaService, { Astria } from "./astria";

export interface ExternalServices {
	astria: Astria
}

export const initExternalServices = (): ExternalServices => {
	return {
		astria: initAstriaService(),
	};
};
