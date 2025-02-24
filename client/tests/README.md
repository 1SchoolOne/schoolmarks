# Documentation Mock Service Worker (MSW)

Ce document explique comment utiliser la configuration de Mock Service Worker (MSW) dans notre suite de tests.

## Aperçu

Notre configuration MSW fournit un serveur HTTP mock qui intercepte les requêtes sortantes pendant les tests. Il est configuré pour gérer différents rôles d'utilisateurs (_admin_, _teacher_, _student_) et les points d'accès API communs.

## Configuration de Base

### Initialisation du Serveur Mock

Le serveur mock est initialisé en utilisant la fonction `getMockServer` :

```typescript
const mockServer = getMockServer(userRole, overrideHandlers?)
```

Paramètres :

- `userRole` : Obligatoire. Un des rôles suivants : 'admin' | 'teacher' | 'student'
- `overrideHandlers` : Optionnel. Tableau de handlers MSW additionnels pour surcharger les comportements par défaut

### Utilisation en Tests

Pour utiliser le serveur mock dans vos fichiers de test, suivez ce modèle :

```typescript
const mockServer = getMockServer('admin') // ou 'teacher' ou 'student'

describe('Votre Suite de Tests', () => {
	beforeAll(() => mockServer.listen({ onUnhandledRequest: 'warn' }))
	beforeEach(() => mockServer.resetHandlers())
	afterAll(() => mockServer.close())

	// Vos tests ici
})
```

## Handlers par Défaut

### Points d'Accès d'Authentification

Le serveur mock automatiquement le point d'accès d'authentification (`/_allauth/browser/v1/auth/session`) basé sur le rôle d'utilisateur fourni. Chaque rôle retourne un profil utilisateur spécifique :

- Admin : `mock.admin@schoolmarks.fr`
- Professeur : `mock.teacher@schoolmarks.fr`
- Étudiant : `mock.student@schoolmarks.fr`

### Points d'Accès API Communs

Les points d'accès suivants sont gérés par défaut :

1. GET `/class_sessions/`

   - Retourne un tableau de sessions de cours
   - La réponse par défaut inclut une session avec des données mock

2. GET `/class_sessions/:id`

   - Retourne une seule session de cours
   - Utilise la même structure de données mock que le point d'accès de liste

3. GET `/checkin_sessions/:id/totp`
   - Retourne un code TOTP mock
   - Réponse par défaut : `{ totp: '123456' }`

## Personnalisation des Réponses

### Surcharge des Handlers

Vous pouvez surcharger les handlers par défaut en passant des handlers personnalisés à `getMockServer` :

```typescript
const customHandlers = [
	http.get(`${API_BASE_URL}/point-acces-personnalise`, () => {
		return HttpResponse.json({ donnees: 'personnalisees' })
	}),
]

const mockServer = getMockServer('admin', customHandlers)
```

### Modifications en Cours d'Exécution

Vous pouvez modifier les handlers pendant les tests en utilisant `mockServer.use()` :

```typescript
test("gère l'état d'erreur", async () => {
	mockServer.use(
		http.get(`${API_BASE_URL}/class_sessions/`, () => {
			return new HttpResponse(null, { status: 500 })
		}),
	)
	// Test de la gestion d'erreur
})
```

## Débogage

En développement (environnement non-CI), le serveur log dans la console les requêtes interceptées :

```
MSW intercepted: GET http://api.example.com/class_sessions
```

## Bonnes Pratiques

1. Toujours nettoyer après les tests :

   - Utiliser les hooks `beforeAll`/`afterAll`
   - Réinitialiser les handlers entre les tests avec `beforeEach`

2. Gérer les requêtes non gérées :

   - Utiliser `onUnhandledRequest: 'warn'` pour détecter les handlers manquants
   - Ajouter des handlers pour tous les points d'accès que votre composant appelle

3. Maintenir des données mock réalistes :
   - Utiliser les mêmes structures de données que votre API
   - Inclure tous les champs requis
   - Utiliser des outils comme `dayjs` pour une gestion cohérente des dates

## Exemple d'Implémentation de Test

```typescript
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@helpers/test'
import { getMockServer } from '../tests/mockServer'
import { http, HttpResponse } from 'msw'

const mockServer = getMockServer('teacher')

describe('ClassSessionList', () => {
  beforeAll(() => mockServer.listen({ onUnhandledRequest: 'warn' }))
  beforeEach(() => mockServer.resetHandlers())
  afterAll(() => mockServer.close())

  it("affiche un message d'erreur en cas d'échec de l'API", async () => {
    // Surcharge du handler par défaut pour le cas d'erreur
    mockServer.use(
      http.get(`${API_BASE_URL}/class_sessions`, () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    renderWithProviders(<ClassSessionList />)
    expect(await screen.findByText(/erreur de chargement des sessions/i)).toBeInTheDocument()
  })
})
```

## Résolution des Problèmes

Problèmes courants et solutions :

1. Requêtes Non Gérées

   - Vérifier la console pour les avertissements concernant les requêtes non gérées
   - Ajouter les handlers appropriés à `commonHandlers` ou utiliser des handlers de surcharge

2. Problèmes d'Authentification

   - Vérifier que le bon rôle est passé à `getMockServer`
   - Vérifier si le composant attend des données utilisateur spécifiques

3. Comportement Incohérent des Tests
   - S'assurer de réinitialiser les handlers entre les tests
   - Vérifier les opérations asynchrones qui doivent être attendues

Pour une aide supplémentaire, consultez la [Documentation MSW](https://mswjs.io/docs/).
