"""Génère le pack de LUTs EXIT (.cube 33³) : python3 make_luts.py"""
import numpy as np
N=33
g=np.linspace(0,1,N)
B,G,R=np.meshgrid(g,g,g,indexing='ij')          # en .cube, le rouge varie le plus vite
rgb=np.stack([R,G,B],-1)
W=np.array([0.2126,0.7152,0.0722])
cl=lambda c:np.clip(c,0,1)
luma=lambda c:(c*W).sum(-1,keepdims=True)
def sat(c,s):l=luma(c);return cl(l+(c-l)*s)
def contrast(c,k):return cl((c-.5)*k+.5)
def sig(c,a):x=cl(c)*2-1;return (np.sign(x)*(1-(1-np.abs(x))**(1+a))+1)/2   # courbe en S
def lift(c,b):return cl(b+c*(1-b))
def tint(c,sh,hi):l=luma(c);return cl(c+np.array(sh)*(1-l)+np.array(hi)*l)  # ombres / hautes lumières
LOOKS={
 'Chaud':      lambda c: sat(tint(c,[.03,.01,-.03],[.05,.02,-.05]),1.08),
 'Froid':      lambda c: sat(tint(c,[-.02,0,.04],[-.04,0,.05]),1.0),
 'Teal-Orange':lambda c: sat(sig(tint(c,[-.05,.01,.06],[.07,.02,-.06]),.35),1.12),
 'Noir-Blanc': lambda c: np.repeat(sig(luma(c),.4),3,-1),
 'Vintage':    lambda c: lift(sat(tint(c,[.03,.02,-.02],[.04,.02,-.04]),.8),.06)*.97,
 'Punchy':     lambda c: sat(sig(c,.5),1.3),
 'Nuit-Club':  lambda c: sat(sig(tint(c,[.03,-.03,.08],[.02,-.02,.05]),.45),1.15),
 'Doux':       lambda c: lift(sat(contrast(c,.9),.85),.03),
}
if __name__=='__main__':
  for name,f in LOOKS.items():
    out=cl(f(rgb.copy())).reshape(-1,3);assert not np.isnan(out).any()
    with open(f'EXIT-{name}.cube','w') as fh:
      fh.write(f'TITLE "EXIT {name}"\nLUT_3D_SIZE {N}\nDOMAIN_MIN 0 0 0\nDOMAIN_MAX 1 1 1\n')
      fh.write('\n'.join(f'{a:.6f} {b:.6f} {c:.6f}' for a,b,c in out)+'\n')
  print('ok',len(LOOKS))
