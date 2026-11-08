#!/usr/bin/env python3
"""Construit la Régie.
  python3 dev/build.py        -> ../index.html (version en ligne, vrai LOCK + numéro de version)
  python3 dev/build.py test   -> dev/tests/index.html (LOCK de test : code drama -> faux OBS)
"""
import sys,time,os
D=os.path.dirname(os.path.abspath(__file__))
src=open(os.path.join(D,'index.src.html')).read()
test=len(sys.argv)>1 and sys.argv[1]=='test'
lock=open(os.path.join(D,'tests/lock_test.json' if test else 'lock.json')).read().strip()
out=src.replace('__LOCK__',lock).replace('__BUILD__',str(int(time.time())))
assert '__LOCK__' not in out and '__BUILD__' not in out
dst=os.path.join(D,'tests/index.html') if test else os.path.join(D,'..','index.html')
open(dst,'w').write(out);print('OK ->',os.path.normpath(dst))
