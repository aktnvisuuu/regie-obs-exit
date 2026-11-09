# EXIT Toolkit : notre IRLToolkit à nous (conception)

Date : 9 novembre 2026 · Demandé par Arthur (EXIT) · Statut : à valider

## 1. Intention

Arthur et son équipe (EXIT, boîte de prod) font des lives IRL Twitch : un cadreur avec un LiveU, et un OBS dans le cloud qui fait la régie. Aujourd'hui, ils louent ce service à IRLToolkit (irl.run). Ils veulent **leur propre version**, aux couleurs d'EXIT, avec :
- toutes les fonctions d'IRLToolkit qu'ils utilisent ;
- un **vrai OBS complet** sur le serveur, sans réglages verrouillés ;
- une interface ordi façon dashboard irl.run, mais avec la DA EXIT.

**La Régie iPhone existante (`index.html` de ce dépôt) ne change pas.** Elle doit continuer à marcher telle quelle sur le nouveau serveur.

Pourquoi : maîtrise totale (fichiers, plugins, réglages), interface à leur image, plus de limites d'IRLToolkit. Par exemple, le Remote d'IRLToolkit ne permet pas de supprimer des fichiers et beaucoup de réglages d'OBS y sont grisés.

## 2. Objectifs, non-objectifs, anti-objectifs

**Objectifs**
- Allumer et éteindre le serveur depuis le site, avec une adresse unique et toujours en ligne.
- Recevoir la caméra : LiveU en SRT ; téléphones en SRT, RTMP et, plus tard, SRTLA.
- Bascule auto Ingest / Ingest Low-bitrate / Ingest Offline selon le débit, avec les mêmes réglages qu'IRLToolkit.
- Envoyer le live vers Twitch avec une clé de stream, sur une ou plusieurs chaînes.
- Ouvrir le vrai OBS dans le navigateur, et gérer les fichiers du serveur (envoi, téléchargement, **suppression**).
- Rester compatible avec la Régie iPhone : même format d'événements que celui qu'envoie IRLToolkit (voir `cloud/README.md`).

**Non-objectifs**
- Proposer l'outil à des créateurs ou clients. Il n'y a ni comptes multiples, ni facturation.
- Plusieurs lives en même temps. Un seul serveur actif à la fois.
- Connexion Twitch par OAuth : la clé de stream suffit, Arthur l'a validé.
- Reprendre les scènes actuelles d'IRLToolkit : on repart de zéro.
- Bot Twitch, alertes sonores, partage d'ingest : plus tard, si besoin.

**Anti-objectifs (échec même si « ça marche »)**
- Un live qui tombe à cause de notre outil : la fiabilité passe avant les fonctions.
- Des clés ou mots de passe visibles dans le dépôt public ou dans une page.
- Une Régie iPhone cassée ou modifiée.

## 3. Contraintes

- Le dépôt GitHub `aktnvisuuu/regie-obs-exit` est public, et le site est hébergé sur GitHub Pages, comme la Régie.
- Le budget n'est pas une contrainte. L'hébergeur sera choisi plus tard ; il faut un serveur avec **carte graphique** loué **à l'heure** (Scaleway, OVH, AWS…). Le code doit donc isoler la partie « hébergeur ».
- Un seul identifiant et un seul mot de passe pour toute l'équipe.
- Interface en français, utilisée surtout sur ordi.
- Le dashboard doit marcher même quand le serveur est éteint : il affiche alors l'état éteint et le bouton Allumer.

## 4. Approches envisagées

| | Approche | Avantages | Inconvénients |
|---|---|---|---|
| A | Site hébergé sur le serveur OBS, plus un mini-site permanent pour se connecter et allumer | simple côté serveur | deux adresses ; l'interface disparaît quand le serveur est éteint |
| **B (choisie)** | **Site unique toujours en ligne (GitHub Pages) + petit service permanent gratuit (« portier ») + serveur OBS à la demande** | une seule adresse, même expérience que la Régie, interface utilisable serveur éteint | un morceau de plus : le portier |
| C | Repartir d'un projet libre existant | moins de code | aucun projet libre ne couvre l'ensemble (bascule auto + dashboard + gestion du serveur) |

Arthur a choisi B.

## 5. Architecture (B)

```
[Site EXIT Toolkit — GitHub Pages]  ←— même dépôt, dossier /toolkit/
        │ 1) mot de passe équipe
        ▼
[Portier — service permanent gratuit (Cloudflare Worker)]
   - vérifie le mot de passe, délivre un jeton de session signé
   - garde la clé API de l'hébergeur (secret) : allumer / éteindre / état du serveur
   - donne l'adresse du serveur quand il tourne
        │ 2) jeton
        ▼
[Serveur OBS (à la demande, GPU)]  — installé par cloud/install.sh
   - OBS complet + obs-websocket (Régie + dashboard)
   - MediaMTX : réception caméra SRT/RTMP (+ SRTLA plus tard)
   - exit-agent : bascule auto, événements format IRLToolkit, ET API HTTP du dashboard
   - bureau à distance (noVNC) : OBS + gestionnaire de fichiers
   - Caddy : HTTPS, vérifie le jeton du portier sur l'API et le bureau à distance
```

- Le jeton est signé par le portier avec un secret partagé avec le serveur, que le serveur reçoit à l'installation. Le serveur vérifie la signature sans rappeler le portier.
- L'adresse du serveur change à chaque allumage, puisque l'hébergeur attribue une nouvelle IP. Le portier la connaît par l'API de l'hébergeur et la renvoie au site. Le certificat HTTPS passe par un domaine de type `<ip>.sslip.io`, comme dans le prototype.
- La Régie iPhone se connecte en wss à OBS, avec l'adresse et le mot de passe du serveur.
- **Adresse fixe (choix du constructeur)** : on réserve chez l'hébergeur une **IP fixe** (IP réservée ou flexible), rattachée au serveur à chaque allumage. Le LiveU (destination SRT dans le portail LiveU) et la Régie sont donc configurés **une seule fois**. HTTPS passe par `<ip-fixe>.sslip.io`, sans domaine à acheter.
- **Entre deux lives (choix du constructeur)** : le serveur est **arrêté, pas supprimé**. Son disque est conservé : scènes, fichiers `dependencies`, LUT, plugins, clés d'ingest, mot de passe OBS. On paie quelques euros par mois de stockage, et ça démarre en 1 à 2 minutes, sans réinstallation. Si un hébergeur ne permet pas l'arrêt, on passe par un volume de stockage séparé plus une image prête à l'emploi.
- **Bascule de la Régie (choix du constructeur)** : l'interface de la Régie ne change pas. On met seulement à jour **une fois** son identifiant chiffré (`dev/lock.json`), pour qu'il pointe vers la nouvelle adresse et le nouveau mot de passe OBS, au moment de quitter IRLToolkit. C'est une mise à jour de données, pas de code.

## 6. Interface (pages et fonctions)

DA : celle de la Régie. Fond `#0a0a0a`, cartes `#151515` / `#1f1f1f`, vert EXIT `#2BE07F`, lime `#C8F169`, orange `#FF8A4C`, rouge `#FF4436`. Grosses tuiles arrondies, typo grasse, logo EXIT (bonhomme qui court). Mise en page « ordi » en grille, utilisable aussi sur tablette. On utilise le skill de design (impeccable) pour la direction et la finition, en partant de la Régie.

**Écran de connexion** : un mot de passe d'équipe, retenu sur l'appareil.

**Dashboard** (équivalent du dashboard irl.run)
- État du serveur : éteint / démarrage (avec la progression) / prêt / en extinction. Boutons Allumer et Éteindre, avec confirmation pour Éteindre, et refus si on est en live.
- Stream : Démarrer / Arrêter, avec confirmation, plus le voyant LIVE et le temps de live.
- Ingest : état, débit, RTT. Boutons Mute / Unmute de l'audio de la caméra, et « Réparer » qui relance la source caméra.
- Scènes : toutes les scènes d'OBS en tuiles ; un robot sur les 3 scènes automatiques.
- Program Monitor : aperçu de la sortie, rafraîchi en continu.
- Graphe du débit de l'ingest sur 60 s, avec les lignes des seuils.
- Barre d'état : stream, ingest, uptime.

**Réglages**
- *Ingests* : les URL à copier par appareil, en RTMP, SRT, SRT LiveU (avec le profil à choisir dans le portail LiveU et la latence) et, plus tard, SRTLA (Moblin, IRL Pro, BELABOX). Les clés sont masquées par défaut, avec un bouton « afficher » et un bouton « régénérer ».
- *Destinations* : liste de destinations (nom, type Twitch / RTMP perso / SRT perso, serveur, clé masquée). Activer, désactiver, supprimer, et multistream sur plusieurs destinations actives.
- *Système* : seuil low-bitrate (kb/s), seuil offline (kb/s), délai de sortie de la scène offline (s), mode de bascule (désactivé / quand on streame / toujours), et prise en compte du RTT SRT (on/off + seuil).
- *Vidéo* : résolution de base et de sortie, images par seconde, débit vidéo, encodeur (NVENC si dispo, sinon x264).
- *Accès* : changer le mot de passe d'équipe, et voir et régénérer le mot de passe OBS utilisé par la Régie.

**OBS**
- *Remote* : l'écran du serveur dans la page (noVNC), avec OBS en plein écran.
- *Fichiers* : liste du dossier `dependencies` avec envoi (glisser-déposer), téléchargement et suppression (avec confirmation).
- *Collections de scènes* : liste, changer, dupliquer, renommer.

## 7. Ce qui est décidé

- Approche B, outil pour EXIT uniquement, un seul live à la fois, un compte et un mot de passe pour l'équipe, Twitch par clé de stream, on repart de zéro, même DA que la Régie, petit service permanent gratuit accepté.
- Arthur veut un vrai OBS complet, accessible et pilotable.
- Le prototype `cloud/` (MediaMTX + agent + install) sert de base au serveur.

## 8. Laissé au constructeur

- Le découpage du code, les bibliothèques et le framework du site (sans dépendance lourde de préférence, comme la Régie).
- Le format exact de l'API de l'agent et du jeton signé.
- L'implémentation du multistream : sorties multiples d'OBS (plugin multi-RTMP), ou rediffusion par MediaMTX / ffmpeg.
- L'hébergeur : on écrit une interface « fournisseur » avec une première implémentation factice pour tester, la vraie viendra quand l'hébergeur sera choisi.
- Les tests : faux OBS pour le site, vrai OBS en local pour le serveur, comme pour la Régie.

## 9. Questions ouvertes

- Arrêt automatique du serveur : voir la réponse d'Arthur ci-dessous.
