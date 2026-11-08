# Régie EXIT : version de référence (8 nov. 2026)

Cette version (commit `7407448`, fiabilité presta incluse) est **la référence**. Toute nouvelle modif part d'ici.

## Ce que fait l'app
- Télécommande iPhone (page web ajoutée à l'écran d'accueil) d'un OBS hébergé chez IRLToolkit (irl.run), via obs-websocket v5 (wss://…:4456).
- Accès protégé par le **code d'équipe** (demandé une fois par téléphone, puis retenu). L'adresse et le mot de passe OBS sont **chiffrés** dans la page (PBKDF2 600k → AES-GCM). Jamais en clair dans le dépôt ni dans un lien.
- Haut : logo + titre « Régie EXIT », voyant (rond rouge = pas en live / hors ligne, pilule verte « LIVE 1:02:05 » = en live, orange = reconnexion), ⚙︎.
- Bouton vert « ⏻ Allumer le serveur » (ouvre irl.run) quand OBS est injoignable ; la Régie se reconnecte seule toutes les 4 s.
- Aperçu de l'antenne (captures d'écran OBS) + vumètre, rien par-dessus l'image. Débit LiveU (carte + graphe), stats Sortie · Perdues · CPU · Img/s (sélecteur) · bouton masquer l'image.
- 2 onglets en bas, centrés, pastille « verre liquide » qui glisse (640 ms) + swipe gauche/droite sur la page :
  - **Scènes** : changer de scène, sources de la scène affichables/masquables sans changer de scène, menu ••• (effets/filtres, durée d'affichage, textes).
  - **Son** : « Micros » (entrée LiveU) + autres pistes, curseurs, mute, vumètres.
- Feuilles (⚙︎ et •••) qui montent en glissant, fermeture en tirant vers le bas.
- Mise à jour auto : la page compare son `BUILD` avec celui en ligne et se recharge si plus récent.

## Fiabilité en presta (ajouté le 8 nov.)
- **Commandes prioritaires** : après chaque toucher (`cmd()`), aucune capture d'aperçu ne part pendant 0,7 s.
- **Aperçu adaptatif** : si les captures ralentissent (réseau saturé), l'aperçu passe tout seul en « allégé » (480 px, 5 img/s max) puis « minimum » (320 px, 1 img/s), et remonte quand ça va mieux.
- **Chien de garde** : si OBS n'envoie plus rien depuis 6 s (connexion fantôme après veille / changement de réseau), ou si la connexion reste bloquée 8 s, reconnexion immédiate. Vérif au retour dans l'app et au retour du réseau.
- **Hors réseau** : `sw.js` garde la page sur le téléphone (réseau d'abord 3 s, sinon version gardée). Les vérifs de mise à jour passent toujours par le réseau.
- **Alertes** (bandeau + vibration 3 coups, rappel toutes les 20 s, seulement en live, option « Alertes qui vibrent » dans ⚙︎) : débit LiveU faible / plus de signal, images perdues ≥ 2 % sur 10 s, CPU ≥ 90 %, micros en MUTE, micros silencieux 8 s, image LiveU figée, stream qui se reconnecte. Sur iPhone la vibration est légère (iOS ne permet qu'un petit retour haptique aux pages web).
- Volontairement **retiré** : Spotify, retour son Twitch 🎧, onglets Lieux/Musiques (sources toujours dans OBS mais cachées de l'app), choix « Entrée LiveU », heure, source d'entrée, textes d'aide, start/stop stream, bouton panique.

## Fichiers
- `index.html` : version en ligne (construite, ne pas éditer à la main).
- `dev/index.src.html` : **source à modifier** (contient `__LOCK__` et `__BUILD__`). Le script est découpé en 17 sections numérotées, avec un sommaire en tête.
- `dev/lock.json` : identifiants OBS chiffrés (public sans risque sans le code).
- `dev/lock.mjs` : rechiffrer si le mot de passe OBS change : `node dev/lock.mjs <code> wss://<hôte>:4456 <motdepasse>` > `dev/lock.json`.
- `dev/build.py` : `python3 dev/build.py` (prod) / `python3 dev/build.py test` (test).
- `sw.js` : garde la page pour l'ouverture sans réseau.
- `dev/tests/` : faux OBS (`fake2.js`, `ingestinit.js`) + tests Playwright : `python3 dev/build.py test && cd dev/tests && for t in test1[6-9].py test20.py; do python3 $t; done` (`test21.py` demande `python3 -m http.server 8765` lancé dans un dossier avec index.html de test + sw.js).

## Règles
- Le mot de passe OBS change si on clique « Generate Password » sur irl.run → il faut rechiffrer `dev/lock.json` sinon plus personne n'entre.
- Ne jamais mettre adresse / mot de passe OBS en clair dans le dépôt ou dans un lien.
- Après push, GitHub Pages met jusqu'à ~10 min ; l'app se met à jour seule ensuite.
