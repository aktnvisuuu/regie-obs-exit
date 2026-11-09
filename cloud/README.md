# EXIT Cloud : notre propre serveur OBS (premier jet)

But : faire ce que fait IRLToolkit, sur un serveur à nous, piloté par la Régie EXIT.

## 1. Comment marche IRLToolkit (analyse, 9 nov. 2026)

| Brique | IRLToolkit | Ce qu'on a observé / lu |
|---|---|---|
| Réception caméra | « Ingests » : URL + clé par appareil | LiveU Solo Pro → **SRT** (destination `SRT-OUT-Caller-Solo`, profil 1080p50/60 H.265, LRT obligatoire) · Moblin → **SRTLA** · OBS/Prism/Streamlabs → RTMP/SRT · BELABOX Cloud → SRT(LA) relayé |
| OBS dans le cloud | OBS complet, sans écran, réglages verrouillés | OBS 3x, source caméra de type `irltk_ingest_source` (« Ingest Player »), dossier `/home/obsuser/dependencies` |
| Bascule auto | « Auto Scene Switcher » | 3 scènes fixes : `Ingest`, `Ingest Low-bitrate`, `Ingest Offline` ; seuils low / offline (chez Arthur 1000 / 150 kb/s) ; modes *quand on streame* / *toujours* / *off* ; se met en pause sur une scène perso ; ne tient pas compte du RTT SRT |
| Infos débit | événements obs-websocket | `CustomEvent` toutes les ~2,5 s : `ingests[]` (`router_bitrate`, `router_rtt`, `media_state`), `main_ingest_id`, `low_bitrate_trigger`, `offline_bitrate_trigger`, `output_status` |
| Télécommande | obs-websocket v5 (sur demande) | port 4456 en wss |
| Sortie | une destination active à la fois | Twitch (Enhanced Broadcasting HEVC jusqu'à 1440p60 selon offre), RTMP perso, SRT perso, RTMP pulldown |
| Bureau à distance | « Remote » dans le navigateur | n.eko (bureau Linux streamé) avec panneau Files : **envoi / téléchargement seulement, pas de suppression** ; presse-papiers |
| Dashboard irl.run | site + compte | Start/Stop stream, mute / fix ingest, scènes, capture, graphe débit, réglages Ingests / Destinations / System / Video / Alerts / Password, collections de scènes |
| Cycle de vie | serveur à la demande | arrêt auto après 10 min sans streamer ; bouton Shutdown |
| Bonus | | bot Twitch (commandes chat), alertes sonores de débit |

## 2. Notre version

| Brique | EXIT Cloud | État |
|---|---|---|
| Réception caméra | **MediaMTX** : SRT (port 8890/udp, `streamid=publish:live:exit:<clé>`) + RTMP (1935) | ✅ testé (faux LiveU SRT) |
| OBS sans écran | OBS + Xvfb + obs-websocket | ✅ testé |
| Source caméra | « Ingest Player » (ffmpeg_source lisant le flux local, reconnexion auto) | ✅ testé |
| Bascule auto | `agent/exit-agent.mjs` : 3 scènes, seuils, délais, **tient compte du RTT SRT**, pause sur scène perso | ✅ testé : Ingest → Low-bitrate → Offline → retour |
| Infos débit pour la Régie | l'agent envoie le **même format** qu'IRLToolkit → la Régie marche sans modif | ✅ testé |
| LUT | filtres « Appliquer une LUT » posés par la Régie | ✅ testé, rendu vérifié |
| Sortie | n'importe quelle destination RTMP/SRT (Twitch…) | ✅ testé vers une sortie locale |
| HTTPS / wss | Caddy + domaine gratuit `<ip>.sslip.io` | ⏳ à tester sur vrai serveur |
| Bureau à distance + fichiers | noVNC + gestionnaire de fichiers **avec suppression** | ⏳ à tester sur vrai serveur |
| Allumer / éteindre le serveur depuis la Régie | API de l'hébergeur | ❌ à faire |
| Arrêt auto, SRTLA (Moblin), bot Twitch | | ❌ à faire |

## 3. Installation (sur un serveur Ubuntu 24.04)
Coller `cloud-init.yaml` à la création du serveur, ou en root :
`curl -fsSL https://aktnvisuuu.github.io/regie-obs-exit/cloud/install.sh | bash`
Les accès (adresse Régie, mots de passe, URL SRT pour le LiveU) sont écrits dans `/root/EXIT-ACCES.txt`.

⚠️ OBS a besoin de puissance : en test sans carte graphique, le rendu était à ~1 image/s. Il faut un serveur avec **GPU** (encodage NVENC) ou au minimum 8 vCPU dédiés pour du 1080p30.

## 4. Fichiers
- `install.sh` : installe tout · `cloud-init.yaml` : installation automatique à la création
- `agent/exit-agent.mjs` : bascule auto + infos débit · `conf/` : MediaMTX, exemple de config agent
- `tools/obsreq.mjs` : envoyer des requêtes à OBS · `tools/test-regie.py` : test Régie ↔ serveur
