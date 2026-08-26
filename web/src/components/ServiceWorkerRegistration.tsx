// Inline and deliberately compact: it runs only after load and adds no bundle.
const REGISTER_SERVICE_WORKER = `(()=>{if(!("serviceWorker"in navigator))return;const e=async()=>{try{const e=await navigator.serviceWorker.register("/sw.js");await navigator.serviceWorker.ready;(e.active||navigator.serviceWorker.controller)?.postMessage({type:"CACHE_CURRENT_PAGE",page:location.pathname})}catch{}};document.readyState==="complete"?e():addEventListener("load",e,{once:!0})})();`;


export default function ServiceWorkerRegistration() {
  return <script dangerouslySetInnerHTML={{ __html: REGISTER_SERVICE_WORKER }} />;
}
