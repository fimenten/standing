(()=>{"use strict";({156:function(){var e=this&&this.__awaiter||function(e,t,n,i){return new(n||(n=Promise))((function(l,s){function o(e){try{h(i.next(e))}catch(e){s(e)}}function r(e){try{h(i.throw(e))}catch(e){s(e)}}function h(e){var t;e.done?l(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(o,r)}h((i=i.apply(e,t||[])).next())}))};class t{constructor(e){this.baseUrl=e}getChannelList(){return e(this,void 0,void 0,(function*(){const e=yield fetch(`${this.baseUrl}/channelList`);if(!e.ok)throw new Error("Failed to fetch channel list");return e.json()}))}getUrls(t){return e(this,void 0,void 0,(function*(){const e=yield fetch(`${this.baseUrl}/getURLs`,{headers:{channel:t}});if(!e.ok)throw new Error("Failed to fetch URLs");return e.json()}))}uploadFile(t,n){return e(this,void 0,void 0,(function*(){const e=new FormData;e.append("file",n);const i=yield fetch(`${this.baseUrl}/upload`,{method:"POST",headers:{channel:t},body:e});if(!i.ok)throw new Error("Failed to upload file");return i.json()}))}}class n{constructor(e,n){this.serverUrl=e,this.channel=n,this.changeCallback=null,this.uploadCallback=null,this.menu=document.createElement("div"),this.content=document.createElement("div"),this.serverUrlInput=document.createElement("input"),this.channelSelect=document.createElement("select"),this.fileInput=document.createElement("input"),this.apiClient=new t(e)}initialize(){return e(this,void 0,void 0,(function*(){this.createMenu(),yield this.loadChannelList()}))}onSettingsChange(e){this.changeCallback=e}onFileUpload(e){this.uploadCallback=e}createMenu(){this.menu.id="hamburger-menu",this.menu.style.position="fixed",this.menu.style.top="10px",this.menu.style.right="10px",this.menu.style.backgroundColor="white",this.menu.style.padding="10px",this.menu.style.border="1px solid black",this.menu.style.zIndex="1000",document.body.appendChild(this.menu);const e=document.createElement("button");e.textContent="☰",e.onclick=e=>{e.stopPropagation(),this.toggleMenu()},this.menu.appendChild(e),this.content.style.display="none",this.menu.appendChild(this.content),this.createServerUrlInput(),this.createChannelSelect(),this.createFileInput(),this.menu.addEventListener("click",(e=>e.stopPropagation()))}toggleMenu(){this.content.style.display="none"===this.content.style.display?"block":"none"}createServerUrlInput(){const e=document.createElement("label");e.textContent="Server URL: ",this.content.appendChild(e),this.serverUrlInput.type="text",this.serverUrlInput.value=this.serverUrl,this.serverUrlInput.onchange=()=>this.updateSettings(),this.content.appendChild(this.serverUrlInput),this.content.appendChild(document.createElement("br"))}createChannelSelect(){const e=document.createElement("label");e.textContent="Channel: ",this.content.appendChild(e),this.channelSelect.onchange=()=>this.updateSettings(),this.content.appendChild(this.channelSelect),this.content.appendChild(document.createElement("br"))}createFileInput(){const t=document.createElement("label");t.textContent="Upload File: ",this.content.appendChild(t),this.fileInput.type="file",this.fileInput.onchange=t=>e(this,void 0,void 0,(function*(){const e=t.target.files;e&&e.length>0&&this.uploadCallback&&(yield this.uploadCallback(e[0]))})),this.content.appendChild(this.fileInput),this.content.appendChild(document.createElement("br"))}loadChannelList(){return e(this,void 0,void 0,(function*(){try{const e=yield this.apiClient.getChannelList();this.channelSelect.innerHTML="",e.forEach((e=>{const t=document.createElement("option");t.value=e,t.textContent=e,this.channelSelect.appendChild(t)})),this.channelSelect.value=this.channel}catch(e){console.error("Failed to load channel list:",e);const t=document.createElement("option");t.value=this.channel,t.textContent=this.channel||"Default Channel",this.channelSelect.appendChild(t)}}))}updateSettings(){const e=this.serverUrlInput.value,t=this.channelSelect.value;this.serverUrl=e,this.channel=t,localStorage.setItem("defaultServer",e),localStorage.setItem("Channel",t),this.changeCallback&&this.changeCallback(e,t)}isMenuOpen(){return"block"===this.content.style.display}}class i{constructor(e,n){this.serverUrl=e,this.channel=n,this.urlList=[],this.currentIndex=0,this.apiClient=new t(e),this.viewerElement=document.createElement("div"),this.viewerElement.id="viewer",this.viewerElement.style.position="fixed",this.viewerElement.style.top="0",this.viewerElement.style.left="0",this.viewerElement.style.width="100%",this.viewerElement.style.height="100%",this.viewerElement.style.display="flex",this.viewerElement.style.justifyContent="center",this.viewerElement.style.alignItems="center",this.viewerElement.style.overflow="hidden",document.body.appendChild(this.viewerElement),this.imageElement=document.createElement("img"),this.imageElement.style.maxWidth="100%",this.imageElement.style.maxHeight="100%",this.imageElement.style.objectFit="contain",this.viewerElement.appendChild(this.imageElement)}initialize(){return e(this,void 0,void 0,(function*(){yield this.loadUrls(),this.render()}))}updateSettings(n,i){return e(this,void 0,void 0,(function*(){this.serverUrl=n,this.channel=i,this.apiClient=new t(n),yield this.loadUrls(),this.render()}))}loadUrls(){return e(this,void 0,void 0,(function*(){try{this.urlList=yield this.apiClient.getUrls(this.channel),this.currentIndex=0}catch(e){console.error("Failed to load URLs:",e),this.urlList=[]}}))}render(){console.log(`Rendering viewer with:\n            Server: ${this.serverUrl}\n            Channel: ${this.channel}\n            Current URL: ${this.urlList[this.currentIndex]||"No URL"}`),this.urlList.length>0?(this.imageElement.src=this.urlList[this.currentIndex],this.imageElement.onload=this.adjustWindowSize.bind(this),this.imageElement.style.display="block",this.viewerElement.textContent="",this.viewerElement.appendChild(this.imageElement)):(this.imageElement.style.display="none",this.viewerElement.textContent="No images available")}adjustWindowSize(){const e=this.imageElement,t=e.naturalWidth/e.naturalHeight,n=window.innerWidth,i=window.innerHeight;n/i>t?window.resizeTo(i*t,i):window.resizeTo(n,n/t)}nextImage(){this.urlList.length>0&&(this.currentIndex=(this.currentIndex+1)%this.urlList.length,this.render())}}class l{constructor(){const e=localStorage.getItem("defaultServerStanding")||"http://localhost:8080",l=localStorage.getItem("Channel")||"default-channel";this.apiClient=new t(e),this.viewer=new i(e,l),this.menu=new n(e,l)}initialize(){return e(this,void 0,void 0,(function*(){yield this.viewer.initialize(),yield this.menu.initialize(),this.menu.onSettingsChange(((t,n)=>e(this,void 0,void 0,(function*(){yield this.viewer.updateSettings(t,n)})))),this.menu.onFileUpload((t=>e(this,void 0,void 0,(function*(){yield this.uploadFile(t)})))),document.addEventListener("click",(e=>{this.menu.isMenuOpen()||this.isClickInsideMenu(e)||this.viewer.nextImage()}))}))}isClickInsideMenu(e){const t=document.getElementById("hamburger-menu");return!!t&&t.contains(e.target)}uploadFile(t){return e(this,void 0,void 0,(function*(){try{const e=yield this.apiClient.uploadFile(localStorage.getItem("Channel")||"default-channel",t);console.log("File uploaded:",e),yield this.viewer.updateSettings(this.apiClient.baseUrl,localStorage.getItem("Channel")||"default-channel")}catch(e){console.error("Failed to upload file:",e)}}))}}"serviceWorker"in navigator&&window.addEventListener("load",(()=>{navigator.serviceWorker.register("/service-worker.js").then((e=>{console.log("Service Worker registered successfully:",e.scope)})).catch((e=>{console.log("Service Worker registration failed:",e)}))})),window.addEventListener("DOMContentLoaded",(()=>e(void 0,void 0,void 0,(function*(){const e=new l;yield e.initialize()}))))}})[156]()})();