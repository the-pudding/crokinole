import{n as l,r as q,u as v,s as k,v as x}from"./scheduler.BLu1fu4S.js";const c=[];function z(e,i){return{subscribe:A(e,i).subscribe}}function A(e,i=l){let r;const n=new Set;function a(t){if(k(e,t)&&(e=t,r)){const o=!c.length;for(const s of n)s[1](),c.push(s,e);if(o){for(let s=0;s<c.length;s+=2)c[s][0](c[s+1]);c.length=0}}}function b(t){a(t(e))}function f(t,o=l){const s=[t,o];return n.add(s),n.size===1&&(r=i(a,b)||l),t(e),()=>{n.delete(s),n.size===0&&r&&(r(),r=null)}}return{set:a,update:b,subscribe:f}}function E(e,i,r){const n=!Array.isArray(e),a=n?[e]:e;if(!a.every(Boolean))throw new Error("derived() expects stores as input, got a falsy value");const b=i.length<2;return z(r,(f,t)=>{let o=!1;const s=[];let d=0,p=l;const g=()=>{if(d)return;p();const u=i(n?s[0]:s,f,t);b?f(u):p=x(u)?u:l},y=a.map((u,_)=>q(u,m=>{s[_]=m,d&=~(1<<_),o&&g()},()=>{d|=1<<_}));return o=!0,g(),function(){v(y),p(),o=!1}})}var h;const T=((h=globalThis.__sveltekit_1fnmwb9)==null?void 0:h.base)??"";var w;const S=((w=globalThis.__sveltekit_1fnmwb9)==null?void 0:w.assets)??T;export{S as a,T as b,E as d,z as r,A as w};
