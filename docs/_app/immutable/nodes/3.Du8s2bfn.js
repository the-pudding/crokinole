import{a as C,e as L,c as $,b as A,f as E,u as F,z as M,g as N,A as R,k as B,w as D}from"../chunks/scheduler.lxN5xj0T.js";import{S as H,i as P,b as V,d as G,m as q,a as U,t as X,e as J}from"../chunks/index.x4oV_jfq.js";import{c as p,g as K,C as Q}from"../chunks/Crokinole.B_pKzyKw.js";import{r as Y}from"../chunks/index.Y-8zMvr6.js";var Z="Expected a function",I=NaN,ee="[object Symbol]",te=/^\s+|\s+$/g,ne=/^[-+]0x[0-9a-f]+$/i,re=/^0b[01]+$/i,ie=/^0o[0-7]+$/i,oe=parseInt,se=typeof p=="object"&&p&&p.Object===Object&&p,ae=typeof self=="object"&&self&&self.Object===Object&&self,ce=se||ae||Function("return this")(),fe=Object.prototype,ue=fe.toString,de=Math.max,le=Math.min,y=function(){return ce.Date.now()};function me(e,t,n){var c,a,r,i,s,u,l=0,h=!1,f=!1,b=!0;if(typeof e!="function")throw new TypeError(Z);t=O(t)||0,w(n)&&(h=!!n.leading,f="maxWait"in n,r=f?de(O(n.maxWait)||0,t):r,b="trailing"in n?!!n.trailing:b);function _(o){var d=c,m=a;return c=a=void 0,l=o,i=e.apply(m,d),i}function S(o){return l=o,s=setTimeout(g,t),h?_(o):i}function x(o){var d=o-u,m=o-l,T=t-d;return f?le(T,r-m):T}function j(o){var d=o-u,m=o-l;return u===void 0||d>=t||d<0||f&&m>=r}function g(){var o=y();if(j(o))return k(o);s=setTimeout(g,x(o))}function k(o){return s=void 0,b&&c?_(o):(c=a=void 0,i)}function W(){s!==void 0&&clearTimeout(s),l=0,c=u=a=s=void 0}function z(){return s===void 0?i:k(y())}function v(){var o=y(),d=j(o);if(c=arguments,a=this,u=o,d){if(s===void 0)return S(u);if(f)return s=setTimeout(g,t),_(u)}return s===void 0&&(s=setTimeout(g,t)),i}return v.cancel=W,v.flush=z,v}function w(e){var t=typeof e;return!!e&&(t=="object"||t=="function")}function he(e){return!!e&&typeof e=="object"}function ge(e){return typeof e=="symbol"||he(e)&&ue.call(e)==ee}function O(e){if(typeof e=="number")return e;if(ge(e))return I;if(w(e)){var t=typeof e.valueOf=="function"?e.valueOf():e;e=w(t)?t+"":t}if(typeof e!="string")return e===0?e:+e;e=e.replace(te,"");var n=re.test(e);return n||ie.test(e)?oe(e.slice(2),n?2:8):ne.test(e)?I:+e}var pe=me;const be=K(pe),_e=()=>{var e;return((e=window==null?void 0:window.visualViewport)==null?void 0:e.width)||document.documentElement.clientWidth},ve=()=>{var e;return((e=window==null?void 0:window.visualViewport)==null?void 0:e.height)||document.documentElement.clientHeight},ye=Y({width:0,height:0},e=>{const t=()=>e({width:_e(),height:ve()});return t(),window.addEventListener("resize",be(t,250)),()=>{window.removeEventListener("resize",t)}});function we(e){let t,n,c,a;return n=new Q({props:{width:e[2],dev:!0,ui:!0}}),{c(){t=L("div"),V(n.$$.fragment),this.h()},l(r){t=$(r,"DIV",{class:!0});var i=A(t);G(n.$$.fragment,i),i.forEach(E),this.h()},h(){F(t,"class","svelte-vkao56"),M(()=>e[6].call(t))},m(r,i){N(r,t,i),q(n,t,null),e[5](t),c=R(t,e[6].bind(t)),a=!0},p(r,[i]){const s={};i&4&&(s.width=r[2]),n.$set(s)},i(r){a||(U(n.$$.fragment,r),a=!0)},o(r){X(n.$$.fragment,r),a=!1},d(r){r&&E(t),J(n),e[5](null),c()}}}function je(e,t,n){let c,a;B(e,ye,f=>n(4,a=f));let r,i,s;function u(){n(2,s=i)}function l(f){D[f?"unshift":"push"](()=>{r=f,n(1,r)})}function h(){i=this.offsetWidth,n(0,i)}return e.$$.update=()=>{e.$$.dirty&1&&n(3,c=i!==void 0),e.$$.dirty&24&&c&&u(a.width)},[i,r,s,c,a,l,h]}class Oe extends H{constructor(t){super(),P(this,t,je,we,C,{})}}export{Oe as component};
