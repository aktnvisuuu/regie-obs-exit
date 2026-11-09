# EXIT Toolkit — Interface (premier jet) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un site EXIT Toolkit visualisable (toutes les pages et menus d'irl.run, DA EXIT) qui tourne en mode démo, puis branché sur un vrai OBS via obs-websocket.

**Architecture:** Une page unique `toolkit/index.html` (HTML/CSS/JS sans dépendance, comme la Régie), navigation par `#/route`. Toutes les données passent par une couche `API` avec deux implémentations : `DemoAPI` (données simulées, état éteint/allumé, débit qui bouge) et `ObsAPI` (obs-websocket v5 vers un vrai OBS, réutilise le SHA-256 et le format d'événements de la Régie). Le portier et l'agent HTTP sont des plans suivants ; ici on les simule dans `DemoAPI`.

**Tech Stack:** HTML/CSS/JS natif, obs-websocket v5, tests Playwright (Python) comme `dev/tests/`.

**Spec:** `docs/superpowers/specs/2026-11-09-exit-toolkit-design.md`

## Global Constraints
- Ne pas modifier la Régie (`index.html`, `dev/index.src.html`).
- DA de la Régie : fond `#0a0a0a`, cartes `#151515`/`#1f1f1f`/`#2b2b2b`, vert `#2BE07F`, lime `#C8F169`, orange `#FF8A4C`, rouge `#FF4436`, logo `logo.png`.
- Interface en français ; mise en page ordi (≥1024 px) utilisable sur tablette (≥768 px).
- Aucune clé ni mot de passe réel dans le dépôt ; clés masquées par défaut dans l'interface.
- Jamais d'arrêt du serveur pendant un live : les boutons Éteindre / arrêt auto sont refusés si le stream est actif.

## Review Focus
- Clic sur « Éteindre » ou arrêt auto pendant un live → refusé avec un message, jamais exécuté.
- « Arrêter le stream » → demande une confirmation (un clic accidentel ne coupe pas le live).
- Serveur éteint → toutes les pages restent consultables, les actions OBS sont grisées avec « Serveur éteint ».
- Connexion OBS perdue en cours d'usage → bandeau « Reconnexion… », reconnexion auto, pas de page blanche.
- Clés de stream / URL d'ingest → masquées par défaut, révélées seulement sur clic « Afficher ».

---

### Task 1: Coquille, connexion, navigation, DA
**Files:** Create `toolkit/index.html` · Test `toolkit/tests/test_shell.py`
**Interfaces — Produces:** `go(route:string)`, routes `#/dashboard #/ingests #/destinations #/systeme #/video #/acces #/obs/remote #/obs/fichiers #/obs/collections` ; `API` (objet courant) ; `toast(msg)`, `confirmBox(title,text,okLabel) -> Promise<bool>`.
- [ ] Test : écran de connexion ; mot de passe démo « exit » → dashboard ; menu haut avec Dashboard / OBS ▾ (Remote, Fichiers, Collections) / Réglages ▾ (Ingests, Destinations, Système, Vidéo, Accès) / Éteindre / Déconnexion ; chaque route affiche son titre.
- [ ] Implémenter, lancer le test (PASS), commit.

### Task 2: DemoAPI + Dashboard
**Interfaces — Produces:** `API.state` `{server:'off'|'booting'|'on'|'stopping', streaming, streamDur, ingest:{kbps,rtt,live,muted}, program, scenes[], lowKbps, offKbps, mode}` ; `API.power(on)`, `API.stream(on)`, `API.setScene(name)`, `API.ingest(action:'mute'|'unmute'|'fix')`, `API.screenshot() -> dataURL`, `API.on(cb)`.
- [ ] Test : serveur éteint → bouton Allumer, actions grisées ; Allumer → « Démarrage » puis prêt ; Start → confirmation non requise, LIVE + chrono ; Stop → confirmation ; Éteindre pendant live → refus ; tuiles scènes (robot sur les 3 auto) ; graphe 60 s avec seuils ; barre d'état.
- [ ] Implémenter, PASS, commit.

### Task 3: Réglages (Ingests, Destinations, Système, Vidéo, Accès)
**Interfaces — Produces:** `API.settings` `{ingests:[{id,name,main,keys:{rtmp,srt,srtLiveu,…}}], destinations:[{id,name,type,server,key,enabled}], system:{lowKbps,offKbps,offExitDelay,mode,rttOn,rttMax}, video:{base,output,fps,bitrate,encoder}}` ; `API.save(section, data)`.
- [ ] Test : onglets d'URL par appareil, clé masquée → « Afficher » révèle ; ajouter/activer/supprimer destination (suppression confirmée) ; plusieurs destinations actives ; Système/Vidéo enregistrent ; Accès régénère.
- [ ] Implémenter, PASS, commit.

### Task 4: OBS (Remote, Fichiers, Collections)
**Interfaces — Produces:** `API.files() -> [{name,size}]`, `API.upload(File)`, `API.remove(name)`, `API.collections()`, `API.setCollection(name)`, `API.remoteUrl() -> string|null`.
- [ ] Test : Remote affiche le cadre (démo : capture d'OBS) ; Fichiers liste, envoi, suppression confirmée ; Collections changer/dupliquer.
- [ ] Implémenter, PASS, commit.

### Task 5: ObsAPI (vrai OBS) + vérification
**Interfaces — Consumes:** tout le contrat `API` ci-dessus. Réglage « Connexion OBS » (adresse + mot de passe) dans Accès, choisi à la place de la démo.
- [ ] Test contre le prototype local (`cloud/`) : scènes réelles, Start/Stop réels, débit reçu des événements format IRLToolkit, perte de connexion → bandeau puis reconnexion.
- [ ] Implémenter, PASS, commit, publier (GitHub Pages `/toolkit/`), captures d'écran envoyées à Arthur.
