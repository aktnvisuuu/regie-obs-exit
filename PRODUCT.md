# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JS, no framework, hosted on GitHub Pages (same as the existing Régie). Delegated: chosen to match the existing project.

## Users

EXIT (Arthur's production company) and his small trusted team. Two surfaces:
- **Régie EXIT** (`index.html`): iPhone home-screen app used one-handed during a live IRL Twitch stream to switch scenes, toggle sources, watch levels, bitrate and alerts. Must not change.
- **EXIT Toolkit** (`toolkit/`): desktop dashboard, mostly used on a **laptop** (13–15"), at the régie table or on the move. Used to power the cloud server on/off, start/stop the stream, watch the ingest, set destinations (Twitch stream keys), switching thresholds, video settings, and open the real OBS remotely.

One shared login for the whole team. One live at a time.

## Product Purpose

An in-house replacement for IRLToolkit (irl.run): our own cloud OBS server (LiveU SRT ingest, automatic Ingest / Low-bitrate / Offline switching, full unlocked OBS) driven by our own interfaces with the EXIT identity. Success: lives run without drops, the team is never lost (same menus and structure as irl.run), and nothing is locked.

## Operating Context

- Live IRL streams: a camera operator with a LiveU Solo Pro (SRT, LRT bonding), the cloud OBS composes and sends to Twitch (marrant_club, Grimkujow…).
- Per-creator intro / pause / outro assets are made by EXIT for each creator; no generic EXIT screens needed.
- The server is rented hourly with a GPU and switched off between lives (disk kept). Auto shutdown after 15 min of inactivity, **never during a live**.

## Capabilities and Constraints

- Dashboard: server power, stream start/stop, ingest (mute / unmute / fix), scenes, program monitor, 60 s bitrate graph, status bar.
- Settings: Ingests (per-device URLs: RTMP, SRT, SRT LiveU, SRTLA later), Destinations (Twitch by stream key, custom RTMP / SRT, multistream), System (low / offline thresholds, offline exit delay, switch mode, SRT RTT), Video, Access.
- OBS: Remote (real OBS in the browser), Files (upload / download / **delete**), Scene collections.
- Never expose keys or passwords in the public repo or pages; keys hidden by default in the UI.
- Interface language: French.

## Brand Commitments

- Name: EXIT. Logo: running-man pictogram (emergency-exit style), `logo.png`.
- Same art direction as the Régie EXIT app: black background, dark cards, EXIT green `#2BE07F` dominant, lime / orange / red for states, big rounded tiles, bold type.
- Structure and menus mirror irl.run so the team is not lost.

## Evidence on Hand

No customers, testimonials or metrics; internal tool. Demo data in the UI is synthetic and labeled "Démo".

## Product Principles

1. The live never drops because of our tool: destructive actions are confirmed and refused during a live.
2. Familiar first: irl.run's structure, EXIT's identity.
3. Nothing locked: full OBS, full files, full settings.
4. Glanceable state: live / server / ingest health readable in one look from a laptop.
