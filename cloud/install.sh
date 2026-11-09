#!/usr/bin/env bash
# =====================================================================
#  EXIT Cloud · installation d'un serveur OBS « maison » (Ubuntu 24.04)
#  Équivalent d'un serveur IRLToolkit :
#    - MediaMTX  : reçoit la caméra (LiveU en SRT, téléphone en SRT/RTMP)
#    - OBS 3x    : tourne sans écran (Xvfb), avec obs-websocket pour la Régie
#    - exit-agent: bascule auto Ingest / Low-bitrate / Offline + infos débit pour la Régie
#    - Caddy     : HTTPS automatique (wss:// pour la Régie, bureau à distance)
#    - noVNC     : voir et manipuler OBS + gestionnaire de fichiers depuis un navigateur
#  Usage (en root) :  curl -fsSL https://aktnvisuuu.github.io/regie-obs-exit/cloud/install.sh | bash
#  ⚠️ PREMIER JET : pas encore testé sur un vrai serveur.
# =====================================================================
set -euo pipefail
SRC="${EXIT_SRC:-https://aktnvisuuu.github.io/regie-obs-exit/cloud}"
MTX_VER="v1.9.3"
U=obsuser
H=/home/$U
IP=$(curl -fsS4 https://api.ipify.org || hostname -I | awk '{print $1}')
DOMAIN="${EXIT_DOMAIN:-$(echo "$IP" | tr . -).sslip.io}"     # domaine gratuit basé sur l'IP (HTTPS auto)
gen(){ tr -dc 'A-Za-z0-9' </dev/urandom | head -c "${1:-20}"; }
OBS_PASS=$(gen 24); VNC_PASS=$(gen 8); SRT_KEY=$(gen 16)

echo "==> Paquets"
export DEBIAN_FRONTEND=noninteractive
apt-get update -q
apt-get install -yq software-properties-common curl ca-certificates xvfb openbox x11vnc novnc websockify thunar ffmpeg ufw debian-keyring debian-archive-keyring apt-transport-https gnupg
add-apt-repository -y ppa:obsproject/obs-studio
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/gpg.key | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt > /etc/apt/sources.list.d/caddy-stable.list
apt-get update -q
apt-get install -yq obs-studio nodejs caddy

echo "==> Utilisateur et dossiers"
id $U >/dev/null 2>&1 || useradd -m -s /bin/bash $U
mkdir -p $H/dependencies /opt/exit-cloud/{agent,conf,bin}

echo "==> MediaMTX"
curl -fsSL "https://github.com/bluenviron/mediamtx/releases/download/$MTX_VER/mediamtx_${MTX_VER}_linux_amd64.tar.gz" | tar xz -C /opt/exit-cloud/bin mediamtx
curl -fsSL "$SRC/conf/mediamtx.yml" -o /opt/exit-cloud/conf/mediamtx.yml
# clé de publication : srt://serveur:8890?streamid=publish:live:<user>:<clé>
sed -i "s/publishUser: \"\"/publishUser: \"exit\"/; s/publishPass: \"\"/publishPass: \"$SRT_KEY\"/" /opt/exit-cloud/conf/mediamtx.yml

echo "==> Agent"
curl -fsSL "$SRC/agent/exit-agent.mjs" -o /opt/exit-cloud/agent/exit-agent.mjs
cat > /opt/exit-cloud/conf/agent.json <<EOF
{"obsUrl":"ws://127.0.0.1:4455","obsPassword":"$OBS_PASS","mode":"streaming","lowKbps":1000,"offlineKbps":150}
EOF

echo "==> OBS (config sans écran + obs-websocket)"
C=$H/.config/obs-studio
mkdir -p $C/plugin_config/obs-websocket $C/basic/profiles/EXIT $C/basic/scenes
cat > $C/plugin_config/obs-websocket/config.json <<EOF
{"alerts_enabled":false,"auth_required":true,"first_load":false,"server_enabled":true,"server_password":"$OBS_PASS","server_port":4455}
EOF
cat > $C/global.ini <<'EOF'
[General]
FirstRun=false
EnableAutoUpdates=false
ConfirmOnExit=false
[Basic]
Profile=EXIT
ProfileDir=EXIT
SceneCollection=EXIT
SceneCollectionFile=EXIT
EOF
cat > $C/basic/profiles/EXIT/basic.ini <<'EOF'
[General]
Name=EXIT
[Video]
BaseCX=1920
BaseCY=1080
OutputCX=1920
OutputCY=1080
FPSType=1
FPSInt=30
[Output]
Mode=Simple
[SimpleOutput]
VBitrate=6000
StreamEncoder=x264
Preset=veryfast
EOF
chown -R $U:$U $H

echo "==> Services"
cat > /etc/systemd/system/exit-xvfb.service <<EOF
[Unit]
Description=EXIT écran virtuel
[Service]
User=$U
ExecStart=/usr/bin/Xvfb :99 -screen 0 1920x1080x24
Restart=always
[Install]
WantedBy=multi-user.target
EOF
cat > /etc/systemd/system/exit-desktop.service <<EOF
[Unit]
Description=EXIT bureau (openbox)
After=exit-xvfb.service
[Service]
User=$U
Environment=DISPLAY=:99
ExecStart=/usr/bin/openbox
Restart=always
[Install]
WantedBy=multi-user.target
EOF
cat > /etc/systemd/system/exit-obs.service <<EOF
[Unit]
Description=EXIT OBS
After=exit-desktop.service
[Service]
User=$U
Environment=DISPLAY=:99
ExecStart=/usr/bin/obs --disable-shutdown-check --minimize-to-tray
Restart=always
RestartSec=3
[Install]
WantedBy=multi-user.target
EOF
cat > /etc/systemd/system/exit-mediamtx.service <<'EOF'
[Unit]
Description=EXIT réception caméra (MediaMTX)
After=network-online.target
[Service]
ExecStart=/opt/exit-cloud/bin/mediamtx /opt/exit-cloud/conf/mediamtx.yml
Restart=always
[Install]
WantedBy=multi-user.target
EOF
cat > /etc/systemd/system/exit-agent.service <<'EOF'
[Unit]
Description=EXIT agent (bascule auto + infos débit)
After=exit-obs.service exit-mediamtx.service
[Service]
Environment=EXIT_AGENT_CONF=/opt/exit-cloud/conf/agent.json
ExecStart=/usr/bin/node /opt/exit-cloud/agent/exit-agent.mjs
Restart=always
[Install]
WantedBy=multi-user.target
EOF
x11vnc -storepasswd "$VNC_PASS" /opt/exit-cloud/conf/vnc.pass >/dev/null
cat > /etc/systemd/system/exit-vnc.service <<'EOF'
[Unit]
Description=EXIT bureau à distance
After=exit-xvfb.service
[Service]
ExecStart=/bin/sh -c 'x11vnc -display :99 -forever -shared -localhost -rfbauth /opt/exit-cloud/conf/vnc.pass -rfbport 5900 & exec websockify --web /usr/share/novnc 127.0.0.1:6080 127.0.0.1:5900'
Restart=always
[Install]
WantedBy=multi-user.target
EOF
cat > /etc/caddy/Caddyfile <<EOF
$DOMAIN {
  handle /obs* {
    uri strip_prefix /obs
    reverse_proxy 127.0.0.1:4455
  }
  handle {
    reverse_proxy 127.0.0.1:6080
  }
}
EOF

echo "==> Pare-feu"
ufw allow 22/tcp; ufw allow 80/tcp; ufw allow 443/tcp; ufw allow 8890/udp; ufw allow 1935/tcp; ufw --force enable

systemctl daemon-reload
systemctl enable --now exit-xvfb exit-desktop exit-mediamtx exit-obs exit-agent exit-vnc
systemctl restart caddy

cat > /root/EXIT-ACCES.txt <<EOF
==================== EXIT Cloud ====================
Régie (connexion manuelle) : wss://$DOMAIN/obs   mot de passe : $OBS_PASS
Bureau à distance (OBS + fichiers) : https://$DOMAIN/vnc.html   mot de passe : $VNC_PASS
Caméra en SRT (LiveU, Larix, Moblin) :
  srt://$IP:8890?streamid=publish:live:exit:$SRT_KEY
Caméra en RTMP : rtmp://$IP:1935/live?user=exit&pass=$SRT_KEY
Fichiers (vidéos, LUT…) : $H/dependencies
====================================================
EOF
cat /root/EXIT-ACCES.txt
