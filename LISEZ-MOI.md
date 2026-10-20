# Famille — GitHub Pages + Firebase

Ce dossier est la version autonome à déposer à la racine d’un dépôt GitHub. Il contient toutes les pages, la connexion e-mail/mot de passe, la vérification d’adresse, le mot de passe oublié, la base partagée, les photos privées et les exports Excel sans images.

## Ce qui reste à configurer

La version est préparée, mais aucun projet Firebase réel ni dépôt GitHub n’est connecté dans cette archive. Les comptes et les e-mails deviennent opérationnels après les étapes ci-dessous. La version actuelle sur chatgpt.site reste séparée et conserve ses données. L’archive ne contient aucune donnée de membre, aucun mot de passe et aucune clé de compte de service. Les données du site actuel ne sont pas transférées automatiquement vers Firebase ; il faut organiser leur reprise avant de remplacer son lien.

Cette version utilise Cloud Functions et Cloud Storage : Firebase demande le forfait **Blaze**, avec facturation à l’usage. Configurer une alerte de budget dans Google Cloud. Aucune souscription n’a été faite pour vous.
Références officielles : https://firebase.google.com/docs/functions/get-started et https://firebase.google.com/docs/storage/web/start

## 1. Créer le projet Firebase

Dans https://console.firebase.google.com/ : créer un projet, puis ajouter une application Web. Copier les six valeurs de configuration affichées (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId). Il y a six valeurs Firebase et une URL API à ajouter après son déploiement.

Dans **Authentication → Sign-in method**, activer **E-mail/Mot de passe**. Dans les paramètres d’authentification, activer la protection contre l’énumération d’adresses et une politique de mot de passe d’au moins 12 caractères. Personnaliser les modèles d’e-mails de vérification et de réinitialisation avec le nom « Famille ». Les liens utilisent le gestionnaire sécurisé de Firebase.

Dans **Authentication → Settings → Authorized domains**, ajouter `VOTRE-COMPTE.github.io` (sans https ni chemin). Pour un domaine personnalisé, ajouter aussi ce domaine.

Créer **Cloud Firestore**, base `(default)`, en mode production, de préférence dans une région européenne. Activer **Storage**, relever le nom exact du bucket. Les règles fournies refusent tout accès direct depuis les navigateurs : les opérations passent par l’API qui vérifie l’utilisateur et ses droits.

## 2. Installer et publier l’API Firebase

Installer Node.js 22 et l’outil officiel Firebase CLI, puis ouvrir un terminal dans le dossier de cette archive :

```text
npm install -g firebase-tools
firebase login
firebase use --add
npm ci
npm ci --prefix functions
```

Choisir votre projet Firebase dans `firebase use --add` et le nommer `default`.
Copier `functions/.env.example` vers `functions/.env` et mettre votre origine GitHub :

```text
ALLOWED_ORIGINS=https://VOTRE-COMPTE.github.io
```

Le chemin `/famille/` ne fait pas partie de l’origine. Pour plusieurs domaines, les séparer par des virgules.
Publier :

```text
firebase deploy --only functions,firestore:rules,storage
```

Copier l’URL HTTPS affichée pour la fonction **api**. Elle se termine normalement par `/api`. C’est la valeur `VITE_API_URL`. Ne pas y ajouter `/family`.

Les identifiants de compte de service n’ont aucune place dans le site ou le dépôt GitHub. L’API déployée utilise son identité Firebase côté serveur.

## 3. Mettre le dossier sur GitHub

Créer un dépôt, par exemple `famille`. Déposer **le contenu de cette archive à sa racine**, avec les dossiers `src`, `functions`, `public` et `.github` et les fichiers package.json, firebase.json, etc. Ne pas ajouter node_modules, .env, dist ou une clé de compte de service.

Dans **Settings → Secrets and variables → Actions → Variables**, ajouter :

| Nom | Valeur |
|---|---|
| VITE_FIREBASE_API_KEY | apiKey de l’application Web |
| VITE_FIREBASE_AUTH_DOMAIN | authDomain |
| VITE_FIREBASE_PROJECT_ID | projectId |
| VITE_FIREBASE_STORAGE_BUCKET | storageBucket |
| VITE_FIREBASE_MESSAGING_SENDER_ID | messagingSenderId |
| VITE_FIREBASE_APP_ID | appId |
| VITE_API_URL | URL de la fonction api publiée à l’étape 2 |

Ce sont les paramètres publics de l’application Web ; ils ne remplacent jamais les règles d’accès ni l’authentification. Les clés privées Firebase Admin restent hors de GitHub.

Dans **Settings → Pages → Build and deployment**, sélectionner **GitHub Actions**. La branche prévue est `main` ; si votre branche porte un autre nom, adapter `.github/workflows/pages.yml`. L’action teste, construit et publie automatiquement le site à chaque envoi sur main. Un dossier nommé `VOTRE-COMPTE.github.io` utilise la racine ; un dépôt normal utilise `/nom-du-depot/`. Avec un domaine personnalisé, mettre `VITE_BASE_PATH: /` dans le workflow.

L’API Firebase se déploie avec la commande Firebase de l’étape 2. Le workflow GitHub Pages ne déploie que les pages ; il n’a pas besoin d’une clé Firebase Admin.

## 4. Première connexion et administrateur

Ouvrir le lien GitHub Pages, cliquer sur **Créer un compte** et renseigner prénom, date de naissance, foyer, e-mail et mot de passe. Vérifier l’adresse via le message reçu, puis revenir et cliquer **J’ai vérifié mon adresse**. Le profil est préparé avec les champs saisis. Si le navigateur a été fermé, le formulaire de profil permet de les compléter à nouveau.

Le compte dont **l’adresse de connexion vérifiée est pierre.valentin8@gmail.com** est administrateur : gestion des profils, événements, commentaires, enfants, crèches, abonnements, idées cadeaux et collections de tous les foyers. Changer l’e-mail de contact dans un profil ne donne pas les droits administrateur. Les réservations des cadeaux restent cachées à leur destinataire, y compris si celui-ci est administrateur.

Le bouton **Mot de passe oublié** envoie un lien de réinitialisation. Aucun mot de passe n’est conservé dans Firestore ou dans le code du site.

## 5. Fonctionnalités et règles

- Agenda : périodes, heure de début et de fin, commentaires, participants, visibilité foyer/famille. Un anniversaire annuel commence à la date choisie, se répète chaque année sur une journée et conserve les commentaires de son événement d’origine. Le 29 février est rappelé le 28 février les années non bissextiles. L’administrateur peut créer des événements universels, toujours visibles malgré les filtres.
- Cadeaux : lien récupérable avec nom, prix et photo lorsque la boutique le permet ; sinon saisie manuelle. Favori avec cœur uniquement par le membre pour sa propre liste. Achats seuls ou groupés, total par devise, quatre tris. Seul le créateur peut modifier une idée pour enfant, avec exception administrateur.
- Crèche : santon ou bâtiment, nom obligatoire, description et photo facultatives, export Excel sans images. Modification par le foyer ou l’administrateur, consultation par toute la famille.
- Collections : photo par exemplaire, quantité, export Excel sans images ; accès personnel, avec exception administrateur.
- Abonnements : liste de plateformes par foyer, consultable par tous et modifiable uniquement par le foyer ou l’administrateur. Aucun identifiant ou mot de passe de plateforme n’est demandé.

## 6. Tester en local

Copier `.env.example` en `.env.local`, y renseigner les paramètres et lancer :

```text
npm ci
npm ci --prefix functions
npm test
npm run dev -- --port 5174
```

Ajouter l’origine locale à `ALLOWED_ORIGINS` pour travailler avec une API de développement. Éviter d’utiliser une base de production pour les essais.

Pour les émulateurs Firebase, installer Java selon la version demandée par Firebase CLI, puis :

```text
firebase emulators:start --project demo-famille
```

Dans `.env.local`, utiliser `VITE_FIREBASE_PROJECT_ID=demo-famille`, une configuration Web de démonstration, `VITE_API_URL=http://127.0.0.1:5001/demo-famille/europe-west1/api` et `VITE_USE_EMULATORS=true`. Ajouter `ALLOWED_ORIGINS=http://127.0.0.1:5174` dans `functions/.env.local`. Les liens de vérification/réinitialisation sont visibles dans l’interface de l’émulateur Auth. Le mode émulateur est activable seulement en développement.

## Vérifications réalisées avant livraison

Compilation de la version statique et du site actuel ; tests des permissions avec plusieurs membres ; événements annuels et horaires ; favoris ; achats groupés ; photos ; exports Excel vérifiés sans images. Les tests du service Firebase utilisent une base simulée. L’envoi réel d’e-mails, le déploiement Firebase et la liaison à GitHub restent à vérifier dans votre projet après configuration.

Documentation : https://firebase.google.com/docs/auth/web/password-auth ; https://firebase.google.com/docs/auth/web/manage-users ; https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Installer Famille sur Android ou iPhone

Le bouton « Installer sur mon téléphone » est disponible en bas du site, y compris avant connexion. Le raccourci porte le nom **Famille** et utilise le logo fourni.

- **Android** : ouvrir le lien GitHub Pages dans Chrome, puis utiliser le bouton d’installation ou le menu ⋮ → Installer l’application / Ajouter à l’écran d’accueil.
- **iPhone ou iPad** : ouvrir le lien dans Safari → Partager → Sur l’écran d’accueil → Ajouter. Si l’option est proposée, conserver l’ouverture en application Web.

Si le lien vient d’une messagerie, l’ouvrir d’abord dans Chrome ou Safari. L’apparition du dialogue automatique dépend du navigateur ; les instructions manuelles restent disponibles. Aucune publication sur les boutiques Apple ou Google n’est nécessaire.

La mise en page est adaptée aux petits écrans, avec des formulaires, listes et commandes utilisables au toucher. Le service worker conserve seulement le logo, les icônes et une page « Hors connexion » : il ne conserve pas les profils, photos de collection, commentaires ou réservations dans un cache hors ligne. Les fonctions partagées et la connexion demandent Internet.

Vérification de l’installation réelle sur Android/iPhone : à effectuer après mise en ligne HTTPS sur votre adresse GitHub Pages. Les fichiers d’installation et l’affichage mobile ont été vérifiés localement ; aucun appareil Android/iPhone physique n’a été utilisé.
