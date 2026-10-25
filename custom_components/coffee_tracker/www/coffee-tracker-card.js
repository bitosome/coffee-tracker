/* Coffee Tracker 0.3.0 | MIT | Space Hub design tokens: see THIRD_PARTY_NOTICES.md */
const t=globalThis,e=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),o=new WeakMap;let s=class{constructor(t,e,o){if(this._$cssResult$=!0,o!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const i=this.t;if(e&&void 0===t){const e=void 0!==i&&1===i.length;e&&(t=o.get(i)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o.set(i,t))}return t}toString(){return this.cssText}};const r=t=>new s("string"==typeof t?t:t+"",void 0,i),n=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,i,o)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[o+1],t[0]);return new s(o,t,i)},a=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return r(e)})(t):t,{is:l,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:f}=Object,u=globalThis,m=u.trustedTypes,g=m?m.emptyScript:"",y=u.reactiveElementPolyfillSupport,b=(t,e)=>t,v={toAttribute(t,e){switch(e){case Boolean:t=t?g:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},x=(t,e)=>!l(t,e),$={attribute:!0,type:String,converter:v,reflect:!1,useDefault:!1,hasChanged:x};Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=$){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),o=this.getPropertyDescriptor(t,i,e);void 0!==o&&c(this.prototype,t,o)}}static getPropertyDescriptor(t,e,i){const{get:o,set:s}=d(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:o,set(e){const r=o?.call(this);s?.call(this,e),this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??$}static _$Ei(){if(this.hasOwnProperty(b("elementProperties")))return;const t=f(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(b("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(b("properties"))){const t=this.properties,e=[...h(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const i=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((i,o)=>{if(e)i.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),s=t.litNonce;void 0!==s&&o.setAttribute("nonce",s),o.textContent=e.cssText,i.appendChild(o)}})(i,this.constructor.elementStyles),i}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,i);if(void 0!==o&&!0===i.reflect){const s=(void 0!==i.converter?.toAttribute?i.converter:v).toAttribute(e,i.type);this._$Em=t,null==s?this.removeAttribute(o):this.setAttribute(o,s),this._$Em=null}}_$AK(t,e){const i=this.constructor,o=i._$Eh.get(t);if(void 0!==o&&this._$Em!==o){const t=i.getPropertyOptions(o),s="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:v;this._$Em=o;const r=s.fromAttribute(e,t.type);this[o]=r??this._$Ej?.get(o)??r,this._$Em=null}}requestUpdate(t,e,i,o=!1,s){if(void 0!==t){const r=this.constructor;if(!1===o&&(s=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??x)(s,e)||i.useDefault&&i.reflect&&s===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:o,wrapped:s},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==s||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===o&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,o=this[e];!0!==t||this._$AL.has(e)||void 0===o||this.C(e,void 0,i,o)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[b("elementProperties")]=new Map,w[b("finalized")]=new Map,y?.({ReactiveElement:w}),(u.reactiveElementVersions??=[]).push("2.1.2");const _=globalThis,k=t=>t,A=_.trustedTypes,E=A?A.createPolicy("lit-html",{createHTML:t=>t}):void 0,C="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,z="?"+S,T=`<${z}>`,R=document,M=()=>R.createComment(""),U=t=>null===t||"object"!=typeof t&&"function"!=typeof t,P=Array.isArray,N="[ \t\n\f\r]",H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,j=/>/g,q=RegExp(`>|${N}(?:([^\\s"'>=/]+)(${N}*=${N}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),L=/'/g,D=/"/g,B=/^(?:script|style|textarea|title)$/i,W=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),G=Symbol.for("lit-noChange"),I=Symbol.for("lit-nothing"),F=new WeakMap,Y=R.createTreeWalker(R,129);function V(t,e){if(!P(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==E?E.createHTML(e):e}const K=(t,e)=>{const i=t.length-1,o=[];let s,r=2===e?"<svg>":3===e?"<math>":"",n=H;for(let e=0;e<i;e++){const i=t[e];let a,l,c=-1,d=0;for(;d<i.length&&(n.lastIndex=d,l=n.exec(i),null!==l);)d=n.lastIndex,n===H?"!--"===l[1]?n=O:void 0!==l[1]?n=j:void 0!==l[2]?(B.test(l[2])&&(s=RegExp("</"+l[2],"g")),n=q):void 0!==l[3]&&(n=q):n===q?">"===l[0]?(n=s??H,c=-1):void 0===l[1]?c=-2:(c=n.lastIndex-l[2].length,a=l[1],n=void 0===l[3]?q:'"'===l[3]?D:L):n===D||n===L?n=q:n===O||n===j?n=H:(n=q,s=void 0);const h=n===q&&t[e+1].startsWith("/>")?" ":"";r+=n===H?i+T:c>=0?(o.push(a),i.slice(0,c)+C+i.slice(c)+S+h):i+S+(-2===c?e:h)}return[V(t,r+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),o]};class X{constructor({strings:t,_$litType$:e},i){let o;this.parts=[];let s=0,r=0;const n=t.length-1,a=this.parts,[l,c]=K(t,e);if(this.el=X.createElement(l,i),Y.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(o=Y.nextNode())&&a.length<n;){if(1===o.nodeType){if(o.hasAttributes())for(const t of o.getAttributeNames())if(t.endsWith(C)){const e=c[r++],i=o.getAttribute(t).split(S),n=/([.?@])?(.*)/.exec(e);a.push({type:1,index:s,name:n[2],strings:i,ctor:"."===n[1]?et:"?"===n[1]?it:"@"===n[1]?ot:tt}),o.removeAttribute(t)}else t.startsWith(S)&&(a.push({type:6,index:s}),o.removeAttribute(t));if(B.test(o.tagName)){const t=o.textContent.split(S),e=t.length-1;if(e>0){o.textContent=A?A.emptyScript:"";for(let i=0;i<e;i++)o.append(t[i],M()),Y.nextNode(),a.push({type:2,index:++s});o.append(t[e],M())}}}else if(8===o.nodeType)if(o.data===z)a.push({type:2,index:s});else{let t=-1;for(;-1!==(t=o.data.indexOf(S,t+1));)a.push({type:7,index:s}),t+=S.length-1}s++}}static createElement(t,e){const i=R.createElement("template");return i.innerHTML=t,i}}function Z(t,e,i=t,o){if(e===G)return e;let s=void 0!==o?i._$Co?.[o]:i._$Cl;const r=U(e)?void 0:e._$litDirective$;return s?.constructor!==r&&(s?._$AO?.(!1),void 0===r?s=void 0:(s=new r(t),s._$AT(t,i,o)),void 0!==o?(i._$Co??=[])[o]=s:i._$Cl=s),void 0!==s&&(e=Z(t,s._$AS(t,e.values),s,o)),e}class J{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,o=(t?.creationScope??R).importNode(e,!0);Y.currentNode=o;let s=Y.nextNode(),r=0,n=0,a=i[0];for(;void 0!==a;){if(r===a.index){let e;2===a.type?e=new Q(s,s.nextSibling,this,t):1===a.type?e=new a.ctor(s,a.name,a.strings,this,t):6===a.type&&(e=new st(s,this,t)),this._$AV.push(e),a=i[++n]}r!==a?.index&&(s=Y.nextNode(),r++)}return Y.currentNode=R,o}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class Q{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,o){this.type=2,this._$AH=I,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Z(this,t,e),U(t)?t===I||null==t||""===t?(this._$AH!==I&&this._$AR(),this._$AH=I):t!==this._$AH&&t!==G&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>P(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==I&&U(this._$AH)?this._$AA.nextSibling.data=t:this.T(R.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,o="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=X.createElement(V(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(e);else{const t=new J(o,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=F.get(t.strings);return void 0===e&&F.set(t.strings,e=new X(t)),e}k(t){P(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,o=0;for(const s of t)o===e.length?e.push(i=new Q(this.O(M()),this.O(M()),this,this.options)):i=e[o],i._$AI(s),o++;o<e.length&&(this._$AR(i&&i._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=k(t).nextSibling;k(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class tt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,o,s){this.type=1,this._$AH=I,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=I}_$AI(t,e=this,i,o){const s=this.strings;let r=!1;if(void 0===s)t=Z(this,t,e,0),r=!U(t)||t!==this._$AH&&t!==G,r&&(this._$AH=t);else{const o=t;let n,a;for(t=s[0],n=0;n<s.length-1;n++)a=Z(this,o[i+n],e,n),a===G&&(a=this._$AH[n]),r||=!U(a)||a!==this._$AH[n],a===I?t=I:t!==I&&(t+=(a??"")+s[n+1]),this._$AH[n]=a}r&&!o&&this.j(t)}j(t){t===I?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class et extends tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===I?void 0:t}}class it extends tt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==I)}}class ot extends tt{constructor(t,e,i,o,s){super(t,e,i,o,s),this.type=5}_$AI(t,e=this){if((t=Z(this,t,e,0)??I)===G)return;const i=this._$AH,o=t===I&&i!==I||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,s=t!==I&&(i===I||o);o&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class st{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Z(this,t)}}const rt=_.litHtmlPolyfillSupport;rt?.(X,Q),(_.litHtmlVersions??=[]).push("3.3.3");const nt=globalThis;let at=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const o=i?.renderBefore??e;let s=o._$litPart$;if(void 0===s){const t=i?.renderBefore??null;o._$litPart$=s=new Q(e.insertBefore(M(),t),t,void 0,i??{})}return s._$AI(t),s})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return G}};at._$litElement$=!0,at.finalized=!0,nt.litElementHydrateSupport?.({LitElement:at});const lt=nt.litElementPolyfillSupport;lt?.({LitElement:at}),(nt.litElementVersions??=[]).push("4.2.2");const ct=n`
  ${r("\n  :host {\n    display: block;\n    /* Chip styling variables */\n    --chip-padding: 2px 2px;\n    --chip-text-font-weight: 700;\n    --chip-text-font-size: var(--chip-font-size, 12px);\n    --chip-background-color: rgba(0,0,0,0.06);\n    --chip-border-radius: var(--ha-badge-border-radius, 999px);\n    --chip-gap: 6px;\n    --main-light-on-bg: linear-gradient(135deg,#ffcf57,#ffb200);\n    --main-light-off-bg: rgba(0,0,0,0.06);\n    --main-light-icon-on-color: #ffffff;\n    --main-light-icon-off-color: var(--secondary-text-color);\n    --switch-on-color: var(--switch-on-yellow, #ffc107);\n    --switch-smart-on-color: var(--switch-on-green, #00c853);\n    --switch-lock-unlocked-color: var(--switch-unlocked-red, #e53935);\n    --lock-spinner-color: var(--primary-text-color, #ffffff);\n    --switch-chip-bg: var(--chip-background-color, rgba(0,0,0,0.06));\n    --switch-icon-size: 28px;\n    --ac-chip-bg-off: rgba(158,158,158,0.95);\n    --ac-chip-bg-cool: #00aaff;\n    --ac-chip-bg-heat: #ff7043;\n    --ac-chip-bg-dry: #ffca28;\n    --ac-chip-bg-fan: #66bb6a;\n    --ac-chip-bg-auto: #26c6da;\n    --ac-chip-bg-default: rgba(0,0,0,0.06);\n    --ac-chip-icon-color: #ffffff;\n    --ac-chip-icon-off-color: #ffffff;\n    --ac-fan-color-off: gray;\n    --ac-fan-color-cool: #00aaff;\n    --ac-fan-color-heat: #ff7043;\n    --ac-fan-color-dry: #ffca28;\n    --ac-fan-color-fan: #66bb6a;\n    --ac-fan-color-auto: #26c6da;\n    --ac-fan-color-default: var(--paper-item-icon-color);\n    --thermostat-heating-color: #ff7043;\n    --thermostat-idle-color: #66bb6a;\n    --thermostat-off-color: gray;\n    --thermostat-pill-heating-bg: var(--state-climate-heat-color, #ff7043);\n    --thermostat-pill-heating-fg: var(--primary-background-color, #fff);\n    --thermostat-pill-idle-bg: var(--chip-background-color, rgba(0,0,0,0.06));\n    --thermostat-pill-idle-fg: var(--secondary-text-color);\n\n    /* Shared semantic status palette (single source of truth across cards) */\n    --status-on-color: #ffc107;\n    --status-active-color: #42a5f5;\n    --status-success-color: #66bb6a;\n    --status-alert-color: #e53935;\n    --status-warn-color: #ff9800;\n    --status-cool-color: #00aaff;\n    --status-heat-color: #ff7043;\n    --status-dry-color: #ffca28;\n    --status-fan-color: #66bb6a;\n    --status-auto-color: #26c6da;\n    --status-smartplug-on-color: #ff9800;\n    --status-presence-color: #42a5f5;\n    --status-icon-on-color: #ffffff;\n\n    /* Positioning variables */\n    --tile-padding: 8px;\n    --tile-padding-large: 12px;\n    --chip-z-index: 3;\n    --tile-z-index: 2;\n    --glow-z-index: 1;\n\n    /* Tile shape control */\n    --tile-border-radius: var(--ha-card-border-radius, 12px);\n\n    /* Common gaps and spacing */\n    --small-gap: 2px;\n    --medium-gap: 6px;\n    --large-gap: 12px;\n\n    /* Shadow variables */\n    --tile-shadow-default: 0 6px 18px rgba(0,0,0,0.10);\n    --tile-shadow-hover: 0 12px 24px rgba(0,0,0,0.16);\n    --tile-shadow-active: 0 18px 40px var(--pulse-strong, rgba(0,0,0,0.18)), 0 6px 18px var(--pulse-weak, rgba(0,0,0,0.10));\n  }\n")}
`,dt={close:"mdi:close",settings:"mdi:cog-outline",details:"mdi:information-outline",history:"mdi:history",back:"mdi:arrow-left",next:"mdi:chevron-right",expand:"mdi:chevron-down",drag:"mdi:drag",add:"mdi:plus",remove:"mdi:minus",check:"mdi:check",edit:"mdi:pencil-outline",undo:"mdi:undo"};function ht(t){return W`<ha-icon .icon=${dt[t]} aria-hidden="true"></ha-icon>`}const pt=n`
  :host {
    --family-gap: 12px;
    --family-grid-gap: 8px;
    --family-surface: var(
      --ha-card-background,
      var(--card-background-color, #fff)
    );
    --family-tile: color-mix(
      in srgb,
      var(--family-surface) 96%,
      var(--primary-text-color) 4%
    );
    --family-muted: var(--secondary-text-color);
    --family-radius: var(--ha-card-border-radius, 24px);
    --family-font: var(
      --ha-font-family-body,
      var(--paper-font-body1_-_font-family, inherit)
    );
    font-family: var(--family-font);
  }
  .family-icon-button {
    display: inline-grid;
    place-items: center;
    min-width: 44px;
    min-height: 44px;
    width: 44px;
    height: 44px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--secondary-text-color);
    font: inherit;
    cursor: pointer;
    flex: 0 0 44px;
    touch-action: manipulation;
  }
  .family-icon-button ha-icon {
    width: 22px;
    height: 22px;
    --mdc-icon-size: 22px;
    flex: 0 0 22px;
  }
  .family-icon-button:focus-visible,
  .family-action:focus-visible,
  .family-chip:is(button):focus-visible {
    outline: 3px solid var(--primary-color);
    outline-offset: 3px;
  }
  .family-icon-button:disabled,
  .family-action:disabled {
    opacity: 0.45;
    cursor: default;
  }
  .family-action {
    min-width: 44px;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
    padding: 8px 14px;
    border: 0;
    border-radius: var(--chip-border-radius, 999px);
    background: color-mix(in srgb, var(--primary-text-color) 7%, transparent);
    color: var(--primary-text-color);
    font: inherit;
    font-family: var(--family-font);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.4;
    cursor: pointer;
    touch-action: manipulation;
  }
  .family-action ha-icon {
    width: 22px;
    height: 22px;
    --mdc-icon-size: 22px;
    flex: 0 0 22px;
  }
  .family-action.primary {
    background: var(--primary-color);
    color: var(--text-primary-color, var(--primary-background-color));
  }
  .family-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 28px;
    padding: 4px 8px;
    border-radius: var(--chip-border-radius, 999px);
    background: var(--chip-background-color);
    font: inherit;
    font-family: var(--family-font);
    font-size: 12px;
    font-weight: 500;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }
  button.family-chip {
    min-height: 44px;
    cursor: pointer;
  }
  .family-surface {
    position: relative;
    z-index: 1;
    background: var(--family-tile);
    border-radius: var(--tile-border-radius, 12px);
    box-shadow: var(--tile-shadow-default);
  }
  @media (hover: hover) {
    .family-icon-button:not(:disabled):hover {
      background: color-mix(in srgb, var(--primary-text-color) 6%, transparent);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .family-action,
    .family-icon-button {
      transition: none !important;
      animation: none !important;
    }
  }
`,ft=n`
  .family-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 8px 3px;
  }
  .family-brand {
    width: 44px;
    height: 44px;
    flex: 0 0 44px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: color-mix(in srgb, var(--primary-color) 10%, transparent);
  }
  .family-brand ha-icon {
    width: 26px;
    height: 26px;
    --mdc-icon-size: 26px;
  }
  .family-identity {
    min-width: 0;
    flex: 1;
  }
  .family-title {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.02em;
    margin: 0;
    overflow-wrap: anywhere;
  }
  .family-subtitle {
    margin-top: 4px;
    color: var(--secondary-text-color);
    font-size: 12px;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }
`;n`
  .family-metrics {
    display: grid;
    grid-template-columns: repeat(
      var(--family-metric-columns, 2),
      minmax(0, 1fr)
    );
    gap: 8px;
    align-items: stretch;
  }
  .family-metric {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    text-align: start;
    padding: 12px;
    display: grid;
    grid-template-rows: 1fr auto;
    gap: 6px;
    min-height: var(--family-metric-height, 100px);
  }
  .family-metric-top {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: 18px auto;
    gap: 6px 4px;
    align-items: center;
    color: var(--secondary-text-color);
  }
  .family-metric-top ha-icon {
    width: 18px;
    height: 18px;
    --mdc-icon-size: 18px;
    grid-column: 1;
    grid-row: 1;
  }
  .family-metric-top .family-metric-trailing {
    width: 16px;
    height: 16px;
    --mdc-icon-size: 16px;
    grid-column: 2;
    opacity: 0.6;
  }
  .family-metric-label {
    grid-column: 1/-1;
    grid-row: 2;
    min-width: 0;
    font-size: 11px;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }
  .family-metric-value {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 2px 3px;
    font-size: clamp(22px, 6.4cqw, 28px);
    font-weight: 550;
    letter-spacing: -0.03em;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }
  .family-metric-value small {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0;
    color: var(--secondary-text-color);
  }
  .family-metric-value.missing {
    font-size: 13px;
    line-height: 1.4;
    letter-spacing: 0;
    min-height: 28px;
    align-items: center;
  }
  @container (max-width:340px) {
    .family-metric {
      padding: 10px;
    }
  }
`,n`
  .family-telemetry {
    display: grid;
    grid-template-columns: repeat(
      var(--family-telemetry-columns, 3),
      minmax(0, 1fr)
    );
    padding: 8px 0;
  }
  .family-telemetry-cell {
    min-width: 0;
    min-height: 48px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 5px;
    padding: 4px 12px;
    border: 0;
    border-inline-end: 1px solid
      color-mix(in srgb, var(--primary-text-color) 7%, transparent);
    background: transparent;
    text-align: start;
    color: inherit;
    font: inherit;
  }
  .family-telemetry-cell:last-child {
    border-inline-end: 0;
  }
  .family-telemetry-label {
    font-size: 11px;
    color: var(--secondary-text-color);
    line-height: 1.35;
    overflow-wrap: anywhere;
  }
  .family-telemetry-value {
    max-width: 100%;
    font-size: 13px;
    font-weight: 550;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }
  @container (max-width:340px) {
    .family-telemetry-cell {
      padding-inline: 10px;
    }
  }
`,n`
  .family-navigation {
    display: grid;
    grid-template-columns: repeat(var(--family-nav-columns, 4), minmax(0, 1fr));
    gap: 4px;
    padding: 5px;
    background: color-mix(in srgb, var(--primary-text-color) 5%, transparent);
    border-radius: var(--tile-border-radius, 12px);
    position: relative;
    z-index: 1;
  }
  .family-navigation button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-height: 56px;
    padding: 8px 4px;
    border: 0;
    background: transparent;
    border-radius: max(0px, calc(var(--tile-border-radius, 12px) - 3px));
    font: inherit;
    font-size: 11px;
    color: var(--secondary-text-color);
    cursor: pointer;
  }
  .family-navigation button[aria-current="page"] {
    background: var(--family-surface);
    color: var(--primary-text-color);
    box-shadow: 0 2px 8px #0001;
  }
  .family-navigation button:focus-visible {
    outline: 3px solid var(--primary-color);
    outline-offset: 1px;
  }
`;const ut=n`
  .family-dialog {
    --family-safe-top: var(
      --safe-area-inset-top,
      env(safe-area-inset-top, 0px)
    );
    --family-safe-bottom: var(
      --safe-area-inset-bottom,
      env(safe-area-inset-bottom, 0px)
    );
    --family-safe-left: var(
      --safe-area-inset-left,
      env(safe-area-inset-left, 0px)
    );
    --family-safe-right: var(
      --safe-area-inset-right,
      env(safe-area-inset-right, 0px)
    );
    --family-available-height: calc(
      100vh - 24px - var(--family-safe-top) - var(--family-safe-bottom)
    );
    position: fixed;
    inset: calc(12px + var(--family-safe-top))
      calc(12px + var(--family-safe-right))
      calc(12px + var(--family-safe-bottom))
      calc(12px + var(--family-safe-left));
    margin: auto;
    padding: 0;
    box-sizing: border-box;
    width: calc(
      100vw - 24px - var(--family-safe-left) - var(--family-safe-right)
    );
    max-width: var(--family-dialog-width, 480px);
    max-height: var(--family-available-height);
    border: 1px solid var(--divider-color, #8883);
    border-radius: var(--family-radius, 24px);
    color: var(--primary-text-color);
    background: var(--family-surface);
    box-shadow: 0 24px 90px #0005;
    overflow: hidden;
    font-family: var(--family-font);
  }
  .family-dialog[open] {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
  }
  .family-dialog.long {
    height: min(760px, var(--family-available-height));
  }
  .family-dialog::backdrop {
    background: #070a1480;
    backdrop-filter: blur(4px);
  }
  .family-dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--divider-color, #8883);
  }
  .family-dialog-header h2,
  .family-dialog-header h3 {
    min-width: 0;
    margin: 0;
    font-size: 18px;
    font-weight: 650;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }
  .family-dialog-body {
    min-width: 0;
    min-height: 0;
    padding: 16px;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }
  .family-dialog-footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid var(--divider-color, #8883);
  }
  .family-dialog button:focus-visible,
  .family-dialog input:focus-visible,
  .family-dialog select:focus-visible {
    outline: 3px solid var(--primary-color);
    outline-offset: 2px;
  }
  .family-dialog input,
  .family-dialog select {
    font-size: 16px;
  }
  @supports (height: 100dvh) {
    .family-dialog {
      --family-available-height: calc(
        100dvh - 24px - var(--family-safe-top) - var(--family-safe-bottom)
      );
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .family-dialog,
    .family-dialog * {
      animation: none !important;
      transition: none !important;
    }
  }
`,mt=new WeakMap;function gt(t,e={}){if(t.open)return;mt.get(t)?.cleanup();const i=e.opener||function(t){let e=t.activeElement;for(;e&&e.shadowRoot&&e.shadowRoot.activeElement;)e=e.shadowRoot.activeElement;return e instanceof HTMLElement?e:void 0}(t.ownerDocument);let o=!1;const s=e=>{const i=t.getBoundingClientRect();return e.target===t&&(e.clientX<i.left||e.clientX>i.right||e.clientY<i.top||e.clientY>i.bottom)},r=t=>{o=s(t)},n=t=>{const i=o&&s(t);o=!1,i&&e.onBackdrop?.()},a=()=>{o=!1},l=()=>{t.removeEventListener("close",c),t.removeEventListener("pointerdown",r),t.removeEventListener("pointerup",n),t.removeEventListener("pointercancel",a),mt.delete(t)},c=()=>{l(),i?.isConnected&&!i.closest("[inert]")&&i.focus({preventScroll:!0})};t.addEventListener("close",c),t.addEventListener("pointerdown",r),t.addEventListener("pointerup",n),t.addEventListener("pointercancel",a),mt.set(t,{opener:i,cleanup:l});try{t.showModal()}catch(t){throw l(),t}e.initialFocus?.focus({preventScroll:!0})}function yt(t){t&&(mt.get(t)?.cleanup(),t.open&&t.close())}const bt=2;class vt{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}const xt=(t,e)=>{const i=t._$AN;if(void 0===i)return!1;for(const t of i)t._$AO?.(e,!1),xt(t,e);return!0},$t=t=>{let e,i;do{if(void 0===(e=t._$AM))break;i=e._$AN,i.delete(t),t=e}while(0===i?.size)},wt=t=>{for(let e;e=t._$AM;t=e){let i=e._$AN;if(void 0===i)e._$AN=i=new Set;else if(i.has(t))break;i.add(t),At(e)}};function _t(t){void 0!==this._$AN?($t(this),this._$AM=t,wt(this)):this._$AM=t}function kt(t,e=!1,i=0){const o=this._$AH,s=this._$AN;if(void 0!==s&&0!==s.size)if(e)if(Array.isArray(o))for(let t=i;t<o.length;t++)xt(o[t],!1),$t(o[t]);else null!=o&&(xt(o,!1),$t(o));else xt(this,t)}const At=t=>{t.type==bt&&(t._$AP??=kt,t._$AQ??=_t)};class Et extends vt{constructor(){super(...arguments),this._$AN=void 0}_$AT(t,e,i){super._$AT(t,e,i),wt(this),this.isConnected=t._$AU}_$AO(t,e=!0){t!==this.isConnected&&(this.isConnected=t,t?this.reconnected?.():this.disconnected?.()),e&&(xt(this,t),$t(this))}setValue(t){if((t=>void 0===t.strings)(this._$Ct))this._$Ct._$AI(t,this);else{const e=[...this._$Ct._$AH];e[this._$Ci]=t,this._$Ct._$AI(e,this,0)}}disconnected(){}reconnected(){}}const Ct=new WeakMap,St=(t=>(...e)=>({_$litDirective$:t,values:e}))(class extends Et{render(t){return I}update(t,[e]){const i=e!==this.G;return i&&this.rt(void 0),(i||this.lt!==this.ct)&&(this.G=e,this.ht=t.options?.host,this.rt(this.ct=t.element)),I}rt(t){if(void 0!==this.G)if(this.isConnected||(t=void 0),"function"==typeof this.G){const e=this.ht??globalThis;let i=Ct.get(e);void 0===i&&(i=new WeakMap,Ct.set(e,i)),void 0!==i.get(this.G)&&this.G.call(this.ht,void 0),i.set(this.G,t),void 0!==t&&this.G.call(this.ht,t)}else this.G.value=t}get lt(){return"function"==typeof this.G?Ct.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}});class zt{constructor(t,e={}){this.host=t,this.options=e,this.routes=[],this.focusAfterUpdate=!1,this.revision=0,this.scrollPositions=new Map,this.confirmationScroll=0,this.returnToDraft=!1,this.confirmation="",this.notice="",this.back=()=>this.canBack?this.attempt("back",()=>{const t=this.current;this.routes.pop(),this.update(t)}):this.close(),this.close=()=>this.attempt("close",()=>this.forceClose()),this.requestBack=()=>this.back(),this.requestClose=()=>this.close(),this.keepEditing=()=>{this.confirmation="",this.deferred=void 0,this.notice="",this.returnToDraft=!0,this.focusAfterUpdate=!0,this.host.requestUpdate()},this.discardAndContinue=()=>{this.deferred?.()},this.onCancel=t=>{t.preventDefault(),this.confirmation?this.keepEditing():this.close()},this.dialogRef=t=>{const e=t;this.dialog&&e!==this.dialog&&yt(this.dialog),this.dialog=e},t.addController?.(this)}get current(){return this.routes[this.routes.length-1]}get stack(){return[...this.routes]}get active(){return this.routes.length>0}get canBack(){return this.routes.length>1}get generation(){return this.revision}isCurrent(t){return this.active&&t===this.revision}configure(t){this.options=t}update(t){t&&this.dialog&&this.scrollPositions.set(t,this.dialog.querySelector(".family-dialog-body")?.scrollTop||0),this.confirmation="",this.notice="",this.deferred=void 0,this.revision++,this.focusAfterUpdate=!0,this.options.onChange?.(this.current,t),this.host.requestUpdate()}open(t,e){return this.attempt("navigate",()=>{const i=this.current;this.active||(this.opener=e),this.scrollPositions.clear(),this.routes=[t],this.update(i)})}push(t){return this.attempt("navigate",()=>{const e=this.current;this.routes.push(t),this.update(e)})}replace(t){return this.attempt("navigate",()=>{const e=this.current;this.routes.splice(Math.max(0,this.routes.length-1),1,t),this.update(e)})}forceClose(t=!0){if(!this.active)return;const e=this.current;var i;t?(i=this.dialog,i?.open&&i.close()):yt(this.dialog),this.routes=[],this.update(e),this.options.onClose?.()}handoff(t){return this.attempt("close",()=>{this.forceClose(!1),t()})}attempt(t,e){const i=this.active?this.options.guard?.(t,this.current):void 0;if(i?.pending)return this.notice=i.message||"Wait for the current request to finish.",this.host.requestUpdate(),!1;if(i?.dirty){if(!this.confirmation){const t=this.dialog?.getRootNode();this.confirmationFocus=t?.activeElement instanceof HTMLElement?t.activeElement:void 0,this.confirmationScroll=this.dialog?.querySelector(".family-dialog-body")?.scrollTop||0}return this.confirmation=i.message||"Discard unsaved changes?",this.deferred=()=>{const i=this.options.guard?.(t,this.current);if(i?.pending)return this.notice=i.message||"Wait for the current request to finish.",void this.host.requestUpdate();i?.discard?.(),e()},this.focusAfterUpdate=!0,this.host.requestUpdate(),!1}return e(),!0}hostUpdated(){if(this.dialog&&this.active&&(gt(this.dialog,{opener:this.opener,onBackdrop:this.close}),this.focusAfterUpdate)){this.focusAfterUpdate=!1;const t=this.dialog.querySelector(".family-dialog-body");if(this.returnToDraft&&(this.returnToDraft=!1,t&&(t.scrollTop=this.confirmationScroll),this.confirmationFocus?.isConnected&&this.dialog.contains(this.confirmationFocus)))return void this.confirmationFocus.focus({preventScroll:!0});t&&!this.confirmation&&this.current&&(t.scrollTop=this.scrollPositions.get(this.current)||0);const e=this.dialog.querySelector("[data-family-initial-focus]");(this.confirmation?this.dialog.querySelector("[data-family-keep]"):e||this.dialog.querySelector("[data-family-heading]"))?.focus({preventScroll:!0})}}hostDisconnected(){yt(this.dialog),this.dialog=void 0,this.routes=[],this.scrollPositions.clear(),this.confirmationFocus=void 0,this.returnToDraft=!1,this.deferred=void 0,this.confirmation="",this.notice="",this.revision++}}function Tt(t,e){return t.active?W`<dialog
    class="family-dialog ${e.long?"long":""} ${e.className||""}"
    id=${e.id||I}
    style=${e.wide?"--family-dialog-width:720px":""}
    aria-label=${e.title}
    aria-describedby=${e.ariaDescribedBy||I}
    @cancel=${t.onCancel}
    ${St(t.dialogRef)}
  >
    <header class="family-dialog-header">
      ${t.canBack&&!t.confirmation?W`<button
            type="button"
            class="family-icon-button"
            title="Back"
            aria-label="Back"
            @click=${t.back}
          >
            ${ht("back")}
          </button>`:I}
      <h2 tabindex="-1" data-family-heading>${e.title}</h2>
      ${i=`Close ${e.title}`,o=t.close,W`<button
    type="button"
    class="family-icon-button"
    title="Close"
    aria-label=${i}
    @click=${o}
  >
    ${ht("close")}
  </button>`}
    </header>
    <div class="family-dialog-body ${e.bodyClass||""}">
      ${t.notice?W`<p class="family-notice" role="status">${t.notice}</p>`:I}
      ${t.confirmation?W`<section aria-label="Unsaved changes">
            <p>${t.confirmation}</p>
            <div class="family-actions">
              <button
                class="family-action"
                type="button"
                data-family-keep
                @click=${t.keepEditing}
              >
                Keep editing
              </button>
              <button
                class="family-action destructive"
                type="button"
                @click=${t.discardAndContinue}
              >
                Discard changes
              </button>
            </div>
          </section>`:I}
      <div ?hidden=${!!t.confirmation}>${e.content}</div>
    </div>
    ${null==e.footer||e.footer===I||!1===e.footer||t.confirmation?I:W`<footer class="family-dialog-footer">${e.footer}</footer>`}
  </dialog>`:I;var i,o}function Rt(t){return W`<button
    type="button"
    class="family-action ${t.primary?"primary":""} ${t.destructive?"destructive":""}"
    title=${t.title||t.label}
    ?disabled=${t.disabled||t.pending}
    aria-busy=${t.pending?"true":"false"}
    @click=${t.onClick}
  >
    ${e=t.icon,e?W`<ha-icon .icon=${e} aria-hidden="true"></ha-icon>`:I}${t.pending?t.pendingLabel||"Saving…":t.label}
  </button>`;var e}function Mt(t){return W`<div
    class="family-notice"
    data-tone=${t.tone||"neutral"}
    role=${"error"===t.tone?"alert":"status"}
  >
    <span>${t.message}</span>${t.action?Rt(t.action):I}
  </div>`}const Ut=n`
  .family-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
  .family-action.destructive {
    color: var(--error-color, var(--status-alert-color, #b3261e));
    background: color-mix(
      in srgb,
      var(--error-color, #b3261e) 10%,
      transparent
    );
  }
  .family-chip {
    border: 0;
    color: var(--primary-text-color);
  }
  .family-chip ha-icon {
    width: 18px;
    height: 18px;
    --mdc-icon-size: 18px;
    flex: 0 0 18px;
  }
  [data-tone="accent"] {
    --family-tone: var(--primary-color);
  }
  [data-tone="success"] {
    --family-tone: var(--success-color, var(--status-success-color, #3b8b42));
  }
  [data-tone="warning"] {
    --family-tone: var(--warning-color, var(--status-warn-color, #a86600));
  }
  [data-tone="error"] {
    --family-tone: var(--error-color, var(--status-alert-color, #b3261e));
  }
  .family-chip[data-tone]:not([data-tone="neutral"]) {
    color: var(--primary-text-color);
    background: color-mix(
      in srgb,
      var(--family-tone) 14%,
      var(--family-surface)
    );
  }
  .family-metric-trailing[data-tone] {
    color: var(--family-tone, var(--secondary-text-color));
  }
  button.family-metric {
    font: inherit;
    color: inherit;
    border: 0;
    cursor: pointer;
  }
  button.family-metric:focus-visible {
    outline: 3px solid var(--primary-color);
    outline-offset: 3px;
  }
  .family-notice {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border-radius: var(--tile-border-radius, 12px);
    font-size: 13px;
    line-height: 1.5;
    background: color-mix(
      in srgb,
      var(--family-tone, var(--primary-text-color)) 8%,
      var(--family-surface)
    );
  }
  .family-disclosure-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    width: 100%;
    border: 0;
    background: transparent;
    color: inherit;
    text-align: start;
    font: inherit;
    cursor: pointer;
  }
  .family-disclosure-toggle > span:first-child {
    flex: 1;
  }
  .family-disclosure-toggle ha-icon {
    width: 22px;
    height: 22px;
    --mdc-icon-size: 22px;
  }
  .family-dialog-header h2 {
    flex: 1;
  }
  .family-dialog [hidden] {
    display: none !important;
  }
`;const Pt=n`
  .family-tile-group {
    isolation: isolate;
  }
  .tile-wrap,
  .family-tile-wrap {
    position: relative;
  }
  .tile-wrap .glow-under,
  .family-tile-wrap .glow-under {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    display: block;
    border-radius: var(--tile-border-radius, 12px);
  }
  .glow-under .glow-overlay {
    position: absolute;
    inset: -10px -14px -18px -14px;
    border-radius: inherit;
    pointer-events: none;
    mix-blend-mode: screen;
    opacity: 0.9;
    -webkit-mask-image: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.25) 18px,
      rgba(0, 0, 0, 0.9) 44px,
      rgba(0, 0, 0, 1) 100%
    );
    mask-image: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.25) 18px,
      rgba(0, 0, 0, 0.9) 44px,
      rgba(0, 0, 0, 1) 100%
    );
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
  }
  .family-tile-face {
    position: relative;
    z-index: 1;
  }
  @keyframes glowPulse {
    0%,
    100% {
      box-shadow: 0 10px 20px var(--pulse-weak);
    }
    50% {
      box-shadow: 0 28px 56px var(--pulse-strong);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .glow-under,
    .glow-overlay {
      animation: none !important;
      transition: none !important;
    }
  }
`,Nt=n`
  :host {
    display: block;
    color: var(--primary-text-color, #26352f);
    font-family: var(--paper-font-body1_-_font-family, inherit);
    --coffee-surface: var(
      --ha-card-background,
      var(--card-background-color, #fff)
    );
    --coffee-muted: var(--secondary-text-color, #69756f);
    --coffee-accent: var(--primary-color, #967956);
    --coffee-tile: color-mix(
      in srgb,
      var(--coffee-surface) 96%,
      var(--primary-text-color, #26352f) 4%
    );
  }
  * {
    box-sizing: border-box;
  }
  ha-card {
    display: block;
    background: var(--coffee-surface);
    border: 1px solid var(--divider-color, #0001);
    border-radius: var(--ha-card-border-radius, 24px);
    padding: var(--tile-padding-large);
    overflow: visible;
  }
  .container {
    container-type: inline-size;
  }
  .root {
    isolation: isolate;
    display: grid;
    gap: var(--large-gap);
  }
  button,
  input {
    font: inherit;
  }
  button {
    color: inherit;
    border: 0;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
  button:disabled {
    opacity: 0.48;
    cursor: default;
  }
  button:focus-visible,
  input:focus-visible,
  summary:focus-visible {
    outline: 3px solid var(--coffee-accent);
    outline-offset: 3px;
  }
  .icon {
    display: block;
    width: 21px;
    height: 21px;
    flex: 0 0 21px;
  }
  ha-icon {
    display: block;
    width: 21px;
    height: 21px;
    flex: 0 0 21px;
    --mdc-icon-size: 21px;
  }
  .brand {
    color: var(--coffee-accent);
  }
  .family-icon-button[aria-expanded="true"] {
    color: var(--coffee-accent);
    background: color-mix(in srgb, var(--coffee-accent) 10%, transparent);
  }
  .tile-wrap {
    position: relative;
    min-width: 0;
  }
  .surface {
    position: relative;
    z-index: 1;
    background: var(--coffee-tile);
    border-radius: var(--tile-border-radius);
    box-shadow: var(--tile-shadow-default);
  }
  .hero {
    padding: 23px 22px 20px;
    overflow: hidden;
  }
  .hero-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .eyebrow {
    font-size: 12px;
    color: var(--coffee-muted);
    font-weight: 550;
    letter-spacing: 0.01em;
  }
  .price {
    display: flex;
    align-items: center;
    gap: 5px;
    border-radius: var(--chip-border-radius);
    background: color-mix(
      in srgb,
      var(--primary-text-color, #26352f) 6%,
      transparent
    );
    padding: 6px 10px;
    font-size: 11px;
    min-height: 44px;
    white-space: nowrap;
    color: var(--coffee-muted);
  }
  .balance-row {
    display: flex;
    align-items: center;
    gap: 2px;
    min-height: 159px;
  }
  .balance-copy {
    flex: 1;
    min-width: 0;
    position: relative;
    z-index: 1;
  }
  .balance {
    display: block;
    font-size: clamp(34px, 11cqw, 52px);
    line-height: 1.15;
    font-weight: 550;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.06em;
    overflow-wrap: anywhere;
  }
  .allowance {
    color: var(--coffee-muted);
    font-size: 12px;
    line-height: 1.5;
    margin-top: 10px;
  }
  .allowance strong {
    color: var(--primary-text-color, #26352f);
    font-weight: 650;
  }
  .cup-wrap {
    position: relative;
    flex: 0 0 125px;
    margin: 3px -7px 0 0;
    color: var(--coffee-accent);
  }
  .cup-art {
    display: block;
    width: 145px;
    max-width: 100%;
    transform-origin: 50% 82%;
  }
  .purchase {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    width: 100%;
    min-height: 51px;
    padding: 13px;
    border-radius: var(--chip-border-radius);
    background: var(--coffee-accent);
    color: var(--text-primary-color, #fff);
    font-size: 14px;
    font-weight: 650;
    position: relative;
    overflow: hidden;
  }
  .purchase .amount {
    white-space: nowrap;
    flex-shrink: 0;
    margin-left: auto;
    opacity: 0.85;
    font-weight: 500;
    font-size: 12px;
    padding-right: 4px;
  }
  .purchase .icon {
    margin-left: 4px;
  }
  .toolbar {
    display: flex;
    gap: 8px;
    margin-top: 11px;
  }
  .tool {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 44px;
    border-radius: var(--chip-border-radius);
    background: color-mix(
      in srgb,
      var(--primary-text-color, #26352f) 5%,
      transparent
    );
    font-size: 12px;
    font-weight: 550;
    flex: 1;
    padding: 8px;
  }
  .tool .icon {
    width: 17px;
    height: 17px;
    flex-basis: 17px;
  }
  .tool[aria-expanded="true"] {
    background: color-mix(in srgb, var(--coffee-accent) 13%, transparent);
    color: var(--coffee-accent);
  }
  .float-amount {
    position: absolute;
    top: 15px;
    left: 20px;
    right: 0;
    text-align: center;
    font-weight: 650;
    font-size: 20px;
    animation: float-up 1.8s ease-out both;
    pointer-events: none;
  }
  .celebrate .cup-art {
    animation: cup-cheers 0.75s ease-in-out;
  }
  .celebrate .steam {
    animation: steam-rise 1.8s ease-out;
  }
  .celebrate.purchase:after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      110deg,
      transparent 25%,
      #fff5 50%,
      transparent 75%
    );
    animation: shine 0.9s ease-out;
  }
  .negative {
    color: var(--status-warn-color);
  }
  .notice {
    position: relative;
    z-index: 1;
    margin: 0;
    font-size: 12px;
    line-height: 1.6;
    padding: 11px 13px;
    background: color-mix(
      in srgb,
      var(--status-warn-color) 10%,
      var(--coffee-surface)
    );
    border-radius: var(--tile-border-radius);
  }
  .error {
    color: var(--error-color, var(--status-alert-color));
    background: color-mix(
      in srgb,
      var(--status-alert-color) 7%,
      var(--coffee-surface)
    );
  }
  .feedback {
    font-size: 12px;
    line-height: 1.55;
    color: var(--coffee-muted);
    padding: 0 7px;
    margin: 0;
  }
  .feedback.success {
    color: var(--status-success-color);
  }
  h2 {
    font-size: 15px;
    font-weight: 650;
    letter-spacing: -0.015em;
    margin: 0;
  }
  .field {
    display: grid;
    gap: 7px;
    font-size: 12px;
    color: var(--coffee-muted);
    margin-top: 14px;
  }
  .field input {
    border: 1px solid var(--divider-color, #0002);
    background: var(--coffee-surface);
    color: var(--primary-text-color, #26352f);
    width: 100%;
    min-height: 48px;
    border-radius: 12px;
    padding: 10px 13px;
    font-size: 16px;
  }
  .field small {
    font-size: 11px;
    line-height: 1.5;
  }
  .presets {
    display: flex;
    gap: 7px;
    margin-top: 10px;
  }
  .presets button {
    flex: 1;
    min-height: 44px;
    border-radius: var(--chip-border-radius);
    background: color-mix(
      in srgb,
      var(--primary-text-color, #26352f) 5%,
      transparent
    );
    font-size: 12px;
  }
  .form-submit {
    margin-top: 16px;
  }
  .form-error {
    margin: 10px 0 0;
    color: var(--status-alert-color);
    font-size: 12px;
    line-height: 1.5;
  }
  .hint {
    font-size: 12px;
    line-height: 1.55;
    color: var(--coffee-muted);
    margin: 0;
  }
  .history-heading {
    margin: 0;
  }
  .history-head {
    padding: 5px 7px;
    width: 100%;
    min-height: 44px;
    border-radius: 12px;
    background: transparent;
    text-align: left;
    font-size: 14px;
    font-weight: 650;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .history-head .count {
    margin-left: auto;
    font-weight: 400;
  }
  #coffee-activity:not([hidden]) {
    display: grid;
    gap: var(--large-gap);
  }
  #coffee-activity[hidden] {
    display: none;
  }
  .count {
    font-size: 11px;
    color: var(--coffee-muted);
  }
  .history {
    padding: 0 15px;
  }
  .entry {
    display: flex;
    gap: 10px;
    align-items: center;
    min-height: 70px;
    padding: 12px 0;
    border-bottom: 1px solid
      color-mix(in srgb, var(--primary-text-color, #26352f) 7%, transparent);
  }
  .entry:last-child {
    border-bottom: 0;
  }
  .entry-icon {
    width: 33px;
    height: 33px;
    display: grid;
    place-items: center;
    flex: 0 0 33px;
    background: color-mix(
      in srgb,
      var(--primary-text-color, #26352f) 5%,
      transparent
    );
    border-radius: 50%;
    color: var(--coffee-muted);
  }
  .entry-icon .icon {
    width: 17px;
    height: 17px;
  }
  .entry-icon.credit {
    color: var(--status-success-color);
    background: color-mix(
      in srgb,
      var(--status-success-color) 10%,
      transparent
    );
  }
  .entry-copy {
    min-width: 0;
    flex: 1;
  }
  .entry-title {
    font-size: 12px;
    font-weight: 600;
    line-height: 1.45;
  }
  .entry-meta {
    font-size: 10px;
    color: var(--coffee-muted);
    margin-top: 4px;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  .entry-note {
    font-size: 11px;
    color: var(--coffee-muted);
    line-height: 1.4;
    margin-top: 3px;
    overflow-wrap: anywhere;
  }
  .entry-value {
    text-align: right;
    white-space: nowrap;
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .entry-value.credit {
    color: var(--status-success-color);
  }
  .entry-balance {
    font-size: 10px;
    font-weight: 400;
    margin-top: 4px;
    color: var(--coffee-muted);
  }
  .text-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 44px;
    padding: 8px 10px;
    color: var(--coffee-accent);
    background: transparent;
    border-radius: 10px;
    font-size: 12px;
  }
  .text-button .icon {
    width: 16px;
    height: 16px;
    flex-basis: 16px;
  }
  .history-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 0 2px;
  }
  .empty {
    padding: 26px 10px;
    text-align: center;
    font-size: 12px;
    color: var(--coffee-muted);
    line-height: 1.7;
  }
  .empty strong {
    display: block;
    color: var(--primary-text-color, #26352f);
    font-weight: 550;
  }
  .undo-confirm {
    padding: 13px;
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-items: center;
  }
  .undo-confirm .hint {
    flex: 1 1 100%;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  .retry-actions {
    display: flex;
    gap: 8px;
  }
  .settings-options {
    display: grid;
    gap: 2px;
  }
  .settings-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: transparent;
    width: 100%;
    text-align: left;
    padding: 8px 0;
    min-height: 51px;
  }
  .settings-option span {
    font-size: 13px;
  }
  .settings-option small {
    display: block;
    color: var(--coffee-muted);
    font-size: 11px;
    margin-top: 4px;
  }
  .settings-option ha-icon {
    color: var(--coffee-muted);
  }
  .danger-option {
    color: var(--error-color, var(--status-alert-color));
  }
  .reset-dialog .family-dialog-body p {
    font-size: 13px;
    line-height: 1.65;
    margin: 0 0 16px;
  }
  .reset-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding: 14px;
    background: var(--coffee-tile);
    border-radius: 12px;
    margin: 14px 0;
  }
  .reset-summary span {
    flex: 1;
    font-size: 11px;
    color: var(--coffee-muted);
  }
  .reset-summary strong {
    display: block;
    margin-top: 6px;
    font-size: 19px;
    color: var(--primary-text-color, #26352f);
  }
  @keyframes cup-cheers {
    0%,
    100% {
      transform: rotate(0) translateY(0);
    }
    35% {
      transform: rotate(-8deg) translateY(-8px);
    }
    70% {
      transform: rotate(4deg) translateY(-3px);
    }
  }
  @keyframes float-up {
    0% {
      transform: translateY(20px);
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    70% {
      opacity: 1;
    }
    100% {
      transform: translateY(-20px);
      opacity: 0;
    }
  }
  @keyframes steam-rise {
    0% {
      transform: translateY(5px);
      opacity: 0.4;
    }
    100% {
      transform: translateY(-12px);
      opacity: 0;
    }
  }
  @keyframes shine {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(100%);
    }
  }
  @container (max-width:340px) {
    .hero {
      padding: 19px 15px 16px;
    }
    .cup-wrap {
      flex-basis: 103px;
      margin-right: -7px;
    }
    .balance-row {
      min-height: 145px;
    }
    .hero-top {
      gap: 6px;
    }
    .price {
      padding: 6px 8px;
      font-size: 10px;
    }
    .history {
      padding: 0 12px;
    }
    .entry {
      gap: 8px;
    }
    .entry-title {
      font-size: 11px;
    }
    .entry-value {
      font-size: 11px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    *,
    *:after {
      animation: none !important;
      transition: none !important;
    }
    .float-amount {
      display: none;
    }
  }
`,Ht={settings:"settings",plus:"add",close:"close",check:"check",adjust:"edit",history:"history",arrow:"next",undo:"undo"},Ot=t=>Ht[t]?ht(Ht[t]):W`<ha-icon icon="mdi:coffee-outline" aria-hidden="true"></ha-icon>`;function jt(t){return"coffee_tracker"===t?.attributes.integration&&"string"==typeof t.attributes.pool_id&&"balance_minor"in t.attributes}function qt(t,e,i="en"){try{return new Intl.NumberFormat(i,{style:"currency",currency:e,minimumFractionDigits:2,maximumFractionDigits:2}).format(t/100)}catch{return`${(t/100).toFixed(2)} ${e}`}}function Lt(t){return(t/100).toFixed(2)}async function Dt(t,e,i){const o=t.callWS?await t.callWS({type:"call_service",domain:"coffee_tracker",service:e,service_data:i,return_response:!0}):await t.callService("coffee_tracker",e,i,void 0,!1,!0);return o&&"object"==typeof o&&"response"in o?o.response:o}const Bt={opening_balance:"Pool opened",add_funds:"Money added",buy_coffee:"Coffee purchased",set_balance:"Balance adjusted",set_price:"Cup price changed",undo:"Action undone"};class Wt extends at{setConfig(t){this.config={...t}}change(t,e){const i={...this.config,[t]:e};this.config=i,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0}))}render(){if(!this.config)return W``;const t=Object.entries(this.hass?.states||{}).filter(([t,e])=>t.startsWith("sensor.")&&jt(e));return W`<label
        >Coffee pool<select
          data-entity
          .value=${this.config.entity}
          @change=${t=>this.change("entity",t.target.value)}
        >
          <option value="">Select a pool</option>
          ${t.map(([t,e])=>W`<option value=${t}>${e.attributes.friendly_name||t}</option>`)}
        </select></label
      ><label
        >Title (optional)<input
          data-title
          .value=${this.config.title||""}
          @input=${t=>this.change("title",t.target.value)}
          placeholder="Coffee pool"
      /></label>
      <p>
        ${t.length?"Balance, cup price, and activity are shared with everyone who can access this pool.":"Add the Coffee Tracker integration in Settings → Devices & services first."}
      </p>`}}Wt.properties={hass:{attribute:!1},config:{state:!0}},Wt.styles=n`
    :host {
      display: block;
    }
    label {
      display: grid;
      gap: 8px;
      font-size: 14px;
      margin: 16px 0;
    }
    select,
    input {
      min-height: 44px;
      padding: 10px;
      font: inherit;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #222);
    }
    p {
      font-size: 12px;
      color: var(--secondary-text-color, #666);
      line-height: 1.6;
    }
  `,customElements.get("coffee-tracker-card-editor")||customElements.define("coffee-tracker-card-editor",Wt);class Gt extends at{constructor(){super(...arguments),this.history=[],this.historyLoading=!1,this.historyError="",this.hasMore=!1,this.nextBefore=null,this.pending=!1,this.pendingAction="",this.mode=null,this.settings=!1,this.amount="",this.note="",this.formError="",this.feedback="",this.error="",this.celebrating=!1,this.spent=0,this.failed=null,this.undoConfirm=!1,this.activityExpanded=!1,this.resetOpen=!1,this.resetSnapshot=null,this.formRevision=0,this.formBaseline={amount:"",note:""},this.operationEpoch=0,this.flow=new zt(this,{guard:t=>({pending:"navigate"===t&&this.pending,dirty:!(!this.mode||this.pending||this.failed||this.amount===this.formBaseline.amount&&this.note===this.formBaseline.note),discard:()=>{this.amount=this.formBaseline.amount,this.note=this.formBaseline.note}}),onChange:t=>{this.mode="add"===t||"balance"===t||"price"===t?t:null,this.settings="settings"===t,this.resetOpen="reset"===t,this.undoConfirm="undo"===t,this.formError="",this.mode&&(this.amount="balance"===this.mode?Lt(this.pool?.balance||0):"price"===this.mode?Lt(this.pool?.price||0):"",this.note="",this.formRevision=this.pool?.revision||0,this.formBaseline={amount:this.amount,note:this.note})}}),this.historyGeneration=0,this.observed=""}setConfig(t){if(!t||"string"!=typeof t.entity||!t.entity.startsWith("sensor."))throw new Error("Select the Coffee Tracker balance sensor.");if(void 0!==t.title&&"string"!=typeof t.title)throw new Error("Title must be text.");this.config?.entity!==t.entity&&(this.flow.forceClose(!1),this.operationEpoch++,this.pending=!1,this.pendingAction="",this.resetOpen=!1,this.resetSnapshot=null,this.activityExpanded=!1,this.historyGeneration++,this.history=[],this.hasMore=!1,this.historyError="",this.historyLoading=!1,this.mode=null,this.settings=!1,this.failed=null,this.error="",this.feedback="",this.observed=""),this.config={...t}}static getConfigElement(){return document.createElement("coffee-tracker-card-editor")}static getStubConfig(t){return{type:"custom:coffee-tracker-card",entity:Object.keys(t?.states||{}).find(e=>e.startsWith("sensor.")&&jt(t.states[e]))||""}}getCardSize(){return this.activityExpanded?7:4}getGridOptions(){return{columns:12,rows:"auto",min_columns:6}}get pool(){return function(t){if(!jt(t)||["unknown","unavailable"].includes(t.state))return null;const e=t.attributes;return![e.balance_minor,e.cup_price_minor,e.revision,e.coffee_count].every(Number.isSafeInteger)||Number(e.cup_price_minor)<=0||"string"!=typeof e.currency?null:{balance:Number(e.balance_minor),price:Number(e.cup_price_minor),revision:Number(e.revision),currency:e.currency,count:Number(e.coffee_count)}}(this.hass?.states[this.config?.entity||""])}get online(){return!1!==this.hass?.connected&&!!this.pool}get supportsReset(){return!0===this.hass?.states[this.config?.entity||""]?.attributes.supports_reset}get locale(){return this.hass?.locale?.language||this.hass?.language||"en"}currency(t){return qt(t,this.pool?.currency||"EUR",this.locale)}updated(t){const e=`${this.config?.entity}:${this.pool?.revision}:${this.online}`;e!==this.observed&&(this.observed=e,this.online&&this.loadHistory())}connectedCallback(){super.connectedCallback(),this.observed="",this.requestUpdate()}disconnectedCallback(){super.disconnectedCallback(),this.resetOpen=!1,this.mode=null,this.settings=!1,this.undoConfirm=!1,this.historyGeneration++,clearTimeout(this.animationTimer),this.celebrating=!1}async loadHistory(t=!1){const e=this.hass,i=this.config?.entity;if(!e||!i||!this.online)return;const o=++this.historyGeneration;this.historyLoading=!0,this.historyError="";try{const s={entity_id:i,limit:5};t&&null!==this.nextBefore&&(s.before=this.nextBefore);const r=await Dt(e,"get_history",s);if(o!==this.historyGeneration||i!==this.config?.entity)return;if(!r||!Array.isArray(r.items))throw new Error("History response was not available.");if(t&&r.revision!==this.pool?.revision)return void this.loadHistory();this.history=t?[...this.history,...r.items.filter(t=>!this.history.some(e=>e.id===t.id))]:r.items,this.hasMore=r.has_more,this.nextBefore=r.next_before}catch(t){o===this.historyGeneration&&(this.historyError=this.errorText(t))}finally{o===this.historyGeneration&&(this.historyLoading=!1)}}errorText(t){return String(t&&"object"==typeof t&&"message"in t?t.message:t||"Could not reach Home Assistant.")}open(t,e){!this.pending&&t&&("settings"===this.flow.current?this.flow.push(t):this.flow.open(t,e))}close(){this.flow.close()}openReset(){this.pending||!this.online||!this.supportsReset||this.failed&&"reset_ledger"!==this.failed.name||("reset_ledger"!==this.failed?.name&&(this.resetSnapshot={...this.pool},this.error=""),"settings"===this.flow.current?this.flow.push("reset"):this.flow.open("reset",this.renderRoot.querySelector('[data-action="retry"]')??void 0))}closeReset(){this.flow.back()}confirmReset(){this.resetOpen&&this.resetSnapshot&&this.supportsReset&&("reset_ledger"===this.failed?.name?this.mutate(this.failed.name,this.failed.data,this.failed.label,this.failed):this.pool?.revision===this.resetSnapshot.revision&&this.mutate("reset_ledger",{confirmed:!0,expected_revision:this.resetSnapshot.revision},"Ledger reset. Previous activity was deleted."))}resetContent(t){if(!this.resetSnapshot)return I;const e="reset_ledger"===this.failed?.name,i=!e&&this.pool?.revision!==this.resetSnapshot.revision;return W`
      <p id="reset-description">
        Delete all activity in <strong>${t}</strong> and reset its balance
        and coffee count to zero. This affects everyone using this pool and
        cannot be undone.
      </p>
      <div class="reset-summary">
        <span
          >Current balance<strong
            >${qt(this.resetSnapshot.balance,this.resetSnapshot.currency,this.locale)}</strong
          ></span
        >
        <span
          >Coffees recorded<strong>${this.resetSnapshot.count}</strong></span
        >
      </div>
      <p class="hint">
        Cup price
        (${qt(this.resetSnapshot.price,this.resetSnapshot.currency,this.locale)})
        and currency (${this.resetSnapshot.currency}) stay the same.
      </p>
      ${this.error?W`<div class="notice error" role="alert">
              ${this.error}
              ${e?W`<p class="hint">The reset was not confirmed. Retry the same request safely, or close and check the balance and activity. A retry will not delete any activity recorded after a completed reset.</p>`:I}
            </div>`:I}
      ${i?W`<p class="form-error" role="status">
                The pool changed since you opened this confirmation. Review the
                latest balance before resetting.
              </p>
              <button
                class="text-button"
                data-action="review-reset"
                ?disabled=${this.pending||!this.online}
                @click=${()=>{this.resetSnapshot={...this.pool},this.error=""}}
              >
                Review latest balance
              </button>`:I}
      ${this.pending?W`<p class="hint" role="status">Resetting ledger. Closing this view will not cancel the request.</p>`:I}
    `}resetFooter(){const t="reset_ledger"===this.failed?.name,e=!t&&this.pool?.revision!==this.resetSnapshot?.revision;return W`
      ${t?I:W`<button
              class="reset-cancel family-action"
              data-family-initial-focus
              data-action="cancel-reset"
              ?disabled=${this.pending}
              @click=${this.closeReset}
            >
              Cancel
            </button>`}
      <button
        class="reset-confirm family-action destructive"
        data-action="confirm-reset"
        ?disabled=${this.pending||!this.online||!this.supportsReset||e}
        @click=${this.confirmReset}
      >
        ${this.pending?"Resetting…":t?"Retry reset":"Reset ledger"}
      </button>
    `}async mutate(t,e,i,o){if(this.pending||!this.online||!this.hass||!this.config||!o&&this.failed)return;const s=o||{name:t,data:{entity_id:this.config.entity,request_id:globalThis.crypto?.randomUUID?.()||`coffee-${Date.now()}-${Math.random().toString(36).slice(2)}`,...e},label:i,price:this.pool.price,entity:this.config.entity},r=this.operationEpoch,n=this.flow.generation;this.pending=!0,this.pendingAction=s.name,this.error="",this.feedback="";try{const t=await Dt(this.hass,s.name,s.data);if(r!==this.operationEpoch||this.config.entity!==s.entity)return;if(!t||!Number.isSafeInteger(t.revision)||!t.transaction_id)throw new Error("Home Assistant did not confirm this action.");if(this.failed=null,this.flow.isCurrent(n)&&this.flow.forceClose(),this.feedback=s.label,"reset_ledger"===s.name&&(this.resetOpen||(this.resetSnapshot=null),this.history=[],this.hasMore=!1,this.nextBefore=null,this.activityExpanded=!1,clearTimeout(this.animationTimer),this.celebrating=!1),"buy_coffee"===s.name){if(this.spent=t.cup_price_minor,this.celebrating=!1,await this.updateComplete,r!==this.operationEpoch||!this.isConnected)return;this.celebrating=!0,clearTimeout(this.animationTimer),this.animationTimer=setTimeout(()=>{this.celebrating=!1},1900)}this.loadHistory()}catch(t){r===this.operationEpoch&&this.config.entity===s.entity&&(this.failed=function(t){if(!t||"object"!=typeof t)return!1;const e=t;return["service_validation_error","unauthorized","invalid_format","not_found","unknown_command","stale_revision","invalid_amount","invalid_request","nothing_to_undo","cannot_undo","request_retired","request_conflict","confirmation_required","missing_request_id"].includes(e.code||"")||["stale_revision","invalid_amount","invalid_request","nothing_to_undo","cannot_undo","request_retired","request_conflict","confirmation_required","missing_request_id"].includes(e.translation_key||"")}(t)?null:s,this.error=this.errorText(t),this.loadHistory())}finally{r===this.operationEpoch&&(this.pending=!1,this.pendingAction="")}}buy(){this.pool&&this.mutate("buy_coffee",{expected_revision:this.pool.revision},"Coffee recorded. Enjoy your break.")}submit(t){if(t.preventDefault(),!this.pool||!this.mode)return;const e=function(t,e=!1){const i=t.trim().replace(",",".");if(!/^-?\d{1,12}(?:\.\d{1,2})?$/.test(i))return null;const[o,s=""]=i.split("."),r=100*Number(o)+(i.startsWith("-")?-1:1)*Number(s.padEnd(2,"0"));return!Number.isSafeInteger(r)||e&&r<=0?null:`${r<0?"-":""}${Math.floor(Math.abs(r)/100)}.${String(Math.abs(r)%100).padStart(2,"0")}`}(this.amount,"balance"!==this.mode);null!==e?"price"===this.mode&&Number(e)>1e4?this.formError="Cup price must be 10,000 or less.":"add"===this.mode?this.mutate("add_funds",{amount:e},`${this.currency(Math.round(100*Number(e)))} added to the pool.`):"balance"===this.mode?this.mutate("set_balance",{amount:e,expected_revision:this.formRevision,...this.note.trim()?{note:this.note.trim()}:{}},"Balance updated."):this.mutate("set_price",{amount:e,expected_revision:this.formRevision},"Cup price updated for future coffees."):this.formError="balance"===this.mode?"Enter an amount with up to two decimal places.":"Enter an amount greater than zero, with up to two decimal places."}date(t){const e=new Date(t);return Number.isFinite(e.getTime())?new Intl.DateTimeFormat(this.locale,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(e):t}entry(t){const e=t.amount_minor>0;return W`<div class="entry">
      <div class="entry-icon ${e?"credit":""}">
        ${Ot("buy_coffee"===t.kind?"coffee":"set_price"===t.kind?"settings":"undo"===t.kind?"undo":e?"plus":"adjust")}
      </div>
      <div class="entry-copy">
        <div class="entry-title">
          ${Bt[t.kind]||"Pool updated"}
        </div>
        <div class="entry-meta">
          <time datetime=${t.timestamp}>${this.date(t.timestamp)}</time> ·
          ${t.actor||"Automation"}
        </div>
        ${t.note?W`<div class="entry-note">${t.note}</div>`:I}
      </div>
      <div class="entry-value ${e?"credit":""}">
        ${"set_price"===t.kind?this.currency(t.cup_price_minor):`${e?"+":""}${this.currency(t.amount_minor)}`}
        <div class="entry-balance">
          ${"set_price"===t.kind?"per cup":`${this.currency(t.balance_minor)} left`}
        </div>
      </div>
    </div>`}editPanel(){if(!this.mode)return I;const t="add"===this.mode?"Add to the pool":"balance"===this.mode?"Adjust balance":"Price per cup",e="add"!==this.mode&&this.pool?.revision!==this.formRevision;return W`<section class="edit-content" aria-label=${t}>
      <p class="hint">
        ${"add"===this.mode?"Record a contribution to the shared coffee pool.":"balance"===this.mode?"Set the correct total. The adjustment stays in the history.":"Applies to everyone. Previous coffees keep their original price."}
      </p>
      <form @submit=${this.submit}>
        <label class="field"
          >${"balance"===this.mode?"New balance":"Amount"}
          (${this.pool?.currency})<input
            data-amount
            data-family-initial-focus
            inputmode="decimal"
            autocomplete="off"
            .value=${this.amount}
            ?disabled=${this.pending||!!this.failed}
            @input=${t=>{this.amount=t.target.value,this.formError=""}}
            placeholder="0.00"
            required
            aria-describedby="amount-hint"
          /><small id="amount-hint"
            >${"balance"===this.mode?"A negative balance represents money owed.":"Use up to two decimal places."}</small
          ></label
        >${"add"===this.mode?W`<div class="presets">
                ${[5,10,20].map(t=>Rt({label:this.currency(100*t),disabled:this.pending||!!this.failed,onClick:()=>{this.amount=t.toFixed(2)}}))}
              </div>`:I}${"balance"===this.mode?W`<label class="field"
                >Reason (optional)<input
                  maxlength="200"
                  .value=${this.note}
                  ?disabled=${this.pending}
                  @input=${t=>{this.note=t.target.value}}
                  placeholder="e.g. Correcting a contribution"
              /></label>`:I}${e?W`<p class="form-error" role="status">
                  The pool changed while you were editing. Review the current
                  balance before saving.
                </p>
                <button
                  type="button"
                  class="text-button"
                  @click=${()=>{this.formRevision=this.pool.revision,this.amount=Lt("balance"===this.mode?this.pool.balance:this.pool.price),this.formBaseline={amount:this.amount,note:this.note}}}
                >
                  Use latest value
                </button>`:I}${this.formError?W`<p class="form-error" role="alert">${this.formError}</p>`:I}<button
          type="submit"
          class="purchase form-submit"
          ?disabled=${this.pending||!!this.failed||e||!this.online}
        >
          ${this.pending?"Saving…":"add"===this.mode?"Add money":"balance"===this.mode?"Save balance":"Save cup price"}
        </button>
      </form>
    </section>`}settingsContent(){return this.pool?W`<div class="settings-options">
        <button
          class="settings-option"
          ?disabled=${this.pending||!!this.failed||!this.online}
          @click=${()=>this.open("price")}
        >
          <span
            >Price per cup<small
              >${this.currency(this.pool.price)} · shared by everyone</small
            ></span
          >${Ot("arrow")}</button
        ><button
          class="settings-option"
          ?disabled=${this.pending||!!this.failed||!this.online}
          @click=${()=>this.open("balance")}
        >
          <span
            >Adjust balance<small
              >Correct the total with an audit trail</small
            ></span
          >${Ot("arrow")}
        </button>
        <button
          class="settings-option danger-option"
          data-action="reset"
          ?disabled=${this.pending||!!this.failed||!this.online||!this.supportsReset}
          @click=${this.openReset}
        >
          <span
            >Reset ledger<small
              >${this.supportsReset?"Delete activity and start the balance at zero":"Restart Home Assistant after updating to enable reset"}</small
            ></span
          >
          <ha-icon icon="mdi:delete-outline" aria-hidden="true"></ha-icon>
        </button>
      </div>
      <p class="hint">
        Your balance and history are saved in Home Assistant, including after
        restarts.
      </p> `:I}renderFlow(t){const e=this.flow.current,i=this.error?Mt({message:this.error,tone:"error",action:this.failed?{label:"reset_ledger"===this.failed.name?"Review reset":"Retry",onClick:()=>{const t=this.failed;"reset_ledger"===t?.name?this.openReset():t&&this.mutate(t.name,t.data,t.label,t)}}:void 0}):this.pending?Mt({message:"Waiting for Home Assistant to confirm. Closing this view will not cancel the request."}):I,o="add"===e?"Add money":"balance"===e?"Adjust balance":"Price per cup";return Tt(this.flow,{title:"settings"===e?"Coffee pool settings":"reset"===e?"Reset ledger?":"undo"===e?"Undo last action?":o,className:`${e}-dialog`,ariaDescribedBy:"reset"===e?"reset-description":void 0,content:"reset"===e?this.resetContent(t):W`${i}${"settings"===e?this.settingsContent():"undo"===e?W`<p>
                      Undo “${this.undoSnapshot?.label}”? A reversal will be
                      added to the history.
                    </p>`:this.editPanel()}`,footer:"reset"===e?this.resetFooter():"undo"===e?W` <button
                  class="family-action"
                  data-family-initial-focus
                  @click=${()=>this.flow.back()}
                >
                  Keep it
                </button>
                <button
                  class="family-action destructive"
                  data-action="confirm-undo"
                  ?disabled=${this.pending||!!this.failed||!this.online||!this.undoSnapshot}
                  @click=${()=>{const t=this.undoSnapshot;t&&this.mutate("undo",{transaction_id:t.transaction_id,expected_revision:t.expected_revision},"Last action undone.")}}
                >
                  Undo action
                </button>`:void 0})}render(){if(!this.config)return I;const t=this.pool,e=this.pending||!!this.failed||!this.online,i=function(t,e="static",i=!1){return t&&"none"!==e&&i?{style:`--pulse-weak: ${t.weak}; --pulse-strong: ${t.strong}; ${"pulse"===e?"animation: glowPulse 2.4s ease-in-out infinite;":""} box-shadow: 0 18px 40px var(--pulse-strong, ${t.strong}), 0 6px 18px var(--pulse-weak, ${t.weak});`,overlay:W`<div class="glow-overlay" aria-hidden="true"></div>`}:{style:"",overlay:I}}({weak:"color-mix(in srgb,var(--coffee-accent) 10%,transparent)",strong:"color-mix(in srgb,var(--coffee-accent) 16%,transparent)"},"static",!!t),o=this.history.find(t=>t.undoable),s=this.config.title||String(this.hass?.states[this.config.entity]?.attributes.friendly_name||"Coffee pool").replace(/ balance$/i,"");return W`<ha-card
      ><div class="container">
        <div class="root">
          <header class="family-header">
            <div class="brand family-brand">${Ot("coffee")}</div>
            <div class="family-identity">
              <h1 class="family-title">${s}</h1>
            </div>
            <button
              class="family-icon-button"
              data-action="settings"
              aria-label="Coffee pool settings"
              aria-expanded=${this.flow.active}
              ?disabled=${!this.online}
              aria-haspopup="dialog"
              @click=${t=>this.flow.open("settings",t.currentTarget)}
            >
              ${Ot("settings")}
            </button>
          </header>
          ${t?W`<div class="tile-wrap">
                    <div class="glow-under" style=${i.style}>
                      ${i.overlay}
                    </div>
                    <section
                      class="surface hero"
                      aria-label="Coffee pool balance"
                    >
                      <div class="hero-top">
                        <span class="eyebrow">Available balance</span
                        ><button
                          class="price"
                          data-action="price"
                          aria-label=${`Change price per cup, currently ${this.currency(t.price)}`}
                          ?disabled=${e}
                          @click=${t=>this.open("price",t.currentTarget)}
                        >
                          ${this.currency(t.price)} / cup
                        </button>
                      </div>
                      <div class="balance-row">
                        <div class="balance-copy">
                          <strong
                            class="balance ${t.balance<0?"negative":""}"
                            data-balance
                            >${this.currency(t.balance)}</strong
                          >
                          <div class="allowance">
                            ${t.balance<0?W`Add money to settle the balance.`:W`Enough for <strong>${Math.floor(Math.max(0,t.balance)/t.price)}</strong> ${1===Math.floor(Math.max(0,t.balance)/t.price)?"coffee":"coffees"}.`}
                          </div>
                        </div>
                        <div
                          class="cup-wrap ${this.celebrating?"celebrate":""}"
                        >
                          ${W`<svg
    class="cup-art"
    aria-hidden="true"
    viewBox="0 0 180 156"
    fill="none"
  >
    <ellipse
      cx="87"
      cy="132"
      rx="66"
      ry="13"
      fill="currentColor"
      opacity=".055"
    />
    <ellipse
      cx="87"
      cy="128"
      rx="57"
      ry="10"
      fill="currentColor"
      opacity=".11"
    />
    <path
      d="M126 64h12c21 0 21 32 0 32h-14"
      stroke="currentColor"
      stroke-width="9"
      opacity=".72"
    />
    <path
      d="M41 55h87v37c0 22-16 35-43 35S41 114 41 92V55Z"
      fill="currentColor"
      opacity=".88"
    />
    <ellipse cx="84.5" cy="55" rx="43.5" ry="12" fill="currentColor" />
    <ellipse
      cx="84.5"
      cy="56"
      rx="35.5"
      ry="7"
      fill="var(--coffee-surface)"
      opacity=".75"
    />
    <path
      d="M56 74v16c0 10 3 17 9 21"
      stroke="var(--coffee-surface)"
      opacity=".4"
      stroke-width="4"
      stroke-linecap="round"
    />
    <g
      class="steam"
      stroke="currentColor"
      stroke-width="3.5"
      stroke-linecap="round"
      opacity=".4"
    >
      <path class="steam-one" d="M67 35c-10-11 10-13 0-25" />
      <path class="steam-two" d="M86 30c-10-11 10-13 0-25" />
      <path class="steam-three" d="M105 35c-10-11 10-13 0-25" />
    </g>
  </svg>`}${this.celebrating?W`<span class="float-amount">−${this.currency(this.spent)}</span>`:I}
                        </div>
                      </div>
                      <button
                        class="purchase ${this.celebrating?"celebrate":""}"
                        data-action="buy"
                        ?disabled=${e}
                        @click=${this.buy}
                      >
                        ${Ot(this.celebrating?"check":"coffee")}<span
                          >${this.pending&&!this.mode?"buy_coffee"===this.pendingAction?"Recording…":"Saving…":this.celebrating?"Enjoy your coffee":"Coffee purchased"}</span
                        ><span class="amount"
                          >−${this.currency(t.price)}</span
                        >
                      </button>
                      <div class="toolbar">
                        <button
                          class="tool"
                          data-action="add"
                          aria-expanded=${"add"===this.mode}
                          ?disabled=${e}
                          @click=${t=>this.open("add",t.currentTarget)}
                        >
                          ${Ot("plus")} Add money</button
                        ><button
                          class="tool"
                          data-action="balance"
                          aria-expanded=${"balance"===this.mode}
                          ?disabled=${e}
                          @click=${t=>this.open("balance",t.currentTarget)}
                        >
                          ${Ot("adjust")} Adjust balance
                        </button>
                      </div>
                    </section>
                  </div>
                  ${this.pending&&"reset_ledger"===this.pendingAction&&!this.resetOpen?W`<p class="notice" role="status">Resetting ledger… Waiting for Home Assistant to confirm.</p>`:I}${this.online?I:W`<p class="notice" role="status">Home Assistant is disconnected. Reconnect to record a coffee.</p>`}${t.balance<t.price&&t.balance>=0?W`<p class="notice">Time for a top-up. You can still record a coffee; the balance will go below zero.</p>`:I}${this.error&&!this.resetOpen?W`<div class="notice error" role="alert">
                          ${this.error}
                          <div class="hint">
                            ${this.failed?"The action was not confirmed. Retry safely with the same request, or check the history before dismissing.":"This action was declined. Review the current values and try again."}
                          </div>
                          <div class="retry-actions">
                            ${this.failed?W`<button
                                    class="text-button"
                                    data-action="retry"
                                    ?disabled=${this.pending||!this.online}
                                    @click=${()=>{"reset_ledger"===this.failed?.name?this.openReset():this.failed&&this.mutate(this.failed.name,this.failed.data,this.failed.label,this.failed)}}
                                  >
                                    ${"reset_ledger"===this.failed.name?"Review reset":"Retry"}
                                  </button>`:I}<button
                              class="text-button"
                              data-action="dismiss"
                              ?disabled=${this.pending}
                              @click=${()=>{this.failed=null,this.error="",this.loadHistory()}}
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>`:I}${this.feedback?Mt({message:this.feedback,tone:"success"}):I}
                  <h2 class="history-heading">
                    <button
                      class="history-head"
                      data-action="activity"
                      aria-expanded=${this.activityExpanded}
                      aria-controls="coffee-activity"
                      @click=${()=>{this.activityExpanded=!this.activityExpanded,this.undoConfirm=!1}}
                    >
                      <span>Activity</span>
                      <span class="count"
                        >${t.count}
                        ${1===t.count?"coffee":"coffees"} enjoyed</span
                      >
                      <ha-icon
                        icon=${this.activityExpanded?"mdi:chevron-up":"mdi:chevron-down"}
                        aria-hidden="true"
                      ></ha-icon>
                    </button>
                  </h2>
                  <div id="coffee-activity" ?hidden=${!this.activityExpanded}>
                    ${this.activityExpanded?W`<section
                              class="surface history"
                              aria-label="Coffee pool history"
                              aria-busy=${this.historyLoading}
                            >
                              ${this.history.length?this.history.map(t=>this.entry(t)):W`<div class="empty">${this.historyLoading?"Loading activity…":W`<strong>Your coffee story starts here.</strong>Add a contribution, then record your first coffee.`}</div>`}
                            </section>
                            ${this.historyError?W`<p class="feedback" role="status">History could not be loaded. ${this.historyError}<button class="text-button" ?disabled=${this.historyLoading||!this.online} @click=${()=>this.loadHistory()}>Try again</button></p>`:I}
                            <div class="history-actions">
                              ${o?W`<button
                                      class="text-button"
                                      data-action="undo"
                                      ?disabled=${e||this.historyLoading}
                                      @click=${e=>{this.undoSnapshot={transaction_id:o.id,expected_revision:t.revision,label:Bt[o.kind]||"last action"},this.flow.open("undo",e.currentTarget)}}
                                    >
                                      ${Ot("undo")} Undo last action
                                    </button>`:W`<span></span>`}${this.hasMore?W`<button class="text-button" data-action="more" ?disabled=${this.historyLoading||!this.online} @click=${()=>this.loadHistory(!0)}>${this.historyLoading?"Loading…":"Older activity"} ${Ot("arrow")}</button>`:I}
                            </div> `:I}
                  </div>`:W`<div class="notice" role="status">
                  ${this.hass?.states[this.config.entity]?"The coffee pool is unavailable. Controls will return when the integration reconnects.":"Select a Coffee Tracker balance sensor in the card settings."}
                </div>`}
        </div>
      </div>
      ${this.renderFlow(s)}</ha-card
    >`}}Gt.properties={hass:{attribute:!1},config:{state:!0},history:{state:!0},historyLoading:{state:!0},historyError:{state:!0},hasMore:{state:!0},pending:{state:!0},pendingAction:{state:!0},mode:{state:!0},settings:{state:!0},amount:{state:!0},note:{state:!0},formError:{state:!0},feedback:{state:!0},error:{state:!0},celebrating:{state:!0},spent:{state:!0},failed:{state:!0},undoConfirm:{state:!0},activityExpanded:{state:!0},resetOpen:{state:!0},resetSnapshot:{state:!0}},Gt.styles=[ct,Nt,pt,ft,ut,Ut,Pt],customElements.get("coffee-tracker-card")||customElements.define("coffee-tracker-card",Gt);const It=window;It.customCards=It.customCards||[],It.customCards.some(t=>"coffee-tracker-card"===t.type)||It.customCards.push({type:"coffee-tracker-card",name:"Coffee Tracker",description:"A shared coffee pool with contributions, one-tap coffees, and an activity history.",preview:!0});export{Gt as CoffeeTrackerCard};
