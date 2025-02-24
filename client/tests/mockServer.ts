import { HttpHandler } from 'msw'
import { setupServer } from 'msw/node'

import { commonHandlers, roleHandler } from './handlers'

/**
 * Retourne un serveur HTTP qui intercepte les requêtes sortantes.
 *
 * L'argument `userRole` est utilisé pour définir le rôle de l'utilisateur
 * actif.
 *
 * Il est possible de surcharger les handlers (aka les routes interceptées) avec
 * l'argument `overrideHandlers`.
 *
 * Lire le `tests/README.md` pour plus de détails.
 */
export function getMockServer(
	userRole: 'admin' | 'teacher' | 'student',
	overrideHandlers: HttpHandler[] = [],
) {
	const mockServer = setupServer(...commonHandlers, ...overrideHandlers, roleHandler[userRole])

	mockServer.events.on('request:start', ({ request }) => {
		if (import.meta.env.CI !== 'true') {
			console.log('MSW intercepted:', request.method, request.url)
		}
	})

	return mockServer
}
