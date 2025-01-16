(()=>{var e={};e.id=548,e.ids=[548],e.modules={846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},4870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},5511:e=>{"use strict";e.exports=require("crypto")},9021:e=>{"use strict";e.exports=require("fs")},1820:e=>{"use strict";e.exports=require("os")},3873:e=>{"use strict";e.exports=require("path")},9551:e=>{"use strict";e.exports=require("url")},8354:e=>{"use strict";e.exports=require("util")},8324:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>h,routeModule:()=>f,serverHooks:()=>v,workAsyncStorage:()=>m,workUnitAsyncStorage:()=>g});var n={};r.r(n),r.d(n,{POST:()=>d});var o=r(2706),a=r(8203),s=r(5994),i=r(2238),l=r(5482),c=r.n(l),p=r(9187);c().config();let u=e=>e?e>=1e12?(e/1e12).toFixed(2)+"T":e>=1e9?(e/1e9).toFixed(2)+"B":e>=1e6?(e/1e6).toFixed(2)+"M":e.toString():"N/A";async function d(e){if("POST"!==e.method)return p.NextResponse.json({error:"Method not allowed"},{status:405});try{let{ticker:t}=await e.json();if(!t)return p.NextResponse.json({error:"Ticker symbol is required"},{status:400});let r=await i.A.quoteSummary(t,{modules:["price","summaryProfile","financialData","defaultKeyStatistics","recommendationTrend","summaryDetail"]}),n={name:r.price?.longName||"N/A",description:r.summaryProfile?.longBusinessSummary||"N/A",marketCap:u(r.price?.marketCap),sharesOutstanding:u(r.defaultKeyStatistics?.sharesOutstanding),float:u(r.defaultKeyStatistics?.floatShares),evEbitda:r.defaultKeyStatistics?.enterpriseToEbitda?.toFixed(2)||"N/A",peTtm:r.summaryDetail?.trailingPE?.toFixed(2)||"N/A",dividendRate:r.summaryDetail?.dividendRate?.toFixed(2)||"N/A",cashPosition:u(r.financialData?.totalCash),totalDebt:u(r.financialData?.totalDebt),debtToEquity:r.financialData?.debtToEquity?.toFixed(2)||"N/A",currentRatio:r.financialData?.currentRatio?.toFixed(2)||"N/A",strengthsAndCatalysts:"Requires manual input or additional API",analystRating:r.financialData?.recommendationMean?.toFixed(2)||"N/A",numberOfAnalysts:r.financialData?.numberOfAnalystOpinions?.toString()||"N/A",meanTargetPrice:r.financialData?.targetMeanPrice?.toFixed(2)||"N/A",impliedChange:r.financialData?.targetMeanPrice&&r.price?.regularMarketPrice?((r.financialData.targetMeanPrice/r.price.regularMarketPrice-1)*100).toFixed(2)+"%":"N/A",risksAndMitigation:"Requires manual input or additional API",recommendation:r.recommendationTrend?.trend&&r.recommendationTrend.trend[0]?.strongBuy&&r.recommendationTrend.trend[0]?.sell?r.recommendationTrend.trend[0].strongBuy>r.recommendationTrend.trend[0].sell?"Buy":"Sell":"N/A"};return p.NextResponse.json(n,{status:200})}catch(e){return console.error("Error fetching stock data:",e),p.NextResponse.json({error:"Failed to fetch stock data"},{status:500})}}let f=new o.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/stock/route",pathname:"/api/stock",filename:"route",bundlePath:"app/api/stock/route"},resolvedPagePath:"/home/siddharth/Downloads/Programming/pptgen (1)/src/app/api/stock/route.js",nextConfigOutput:"",userland:n}),{workAsyncStorage:m,workUnitAsyncStorage:g,serverHooks:v}=f;function h(){return(0,s.patchFetch)({workAsyncStorage:m,workUnitAsyncStorage:g})}},6487:()=>{},8335:()=>{},5482:(e,t,r)=>{let n=r(9021),o=r(3873),a=r(1820),s=r(5511),i=r(7336).version,l=/(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;function c(e){console.log(`[dotenv@${i}][DEBUG] ${e}`)}function p(e){return e&&e.DOTENV_KEY&&e.DOTENV_KEY.length>0?e.DOTENV_KEY:process.env.DOTENV_KEY&&process.env.DOTENV_KEY.length>0?process.env.DOTENV_KEY:""}function u(e){let t=null;if(e&&e.path&&e.path.length>0){if(Array.isArray(e.path))for(let r of e.path)n.existsSync(r)&&(t=r.endsWith(".vault")?r:`${r}.vault`);else t=e.path.endsWith(".vault")?e.path:`${e.path}.vault`}else t=o.resolve(process.cwd(),".env.vault");return n.existsSync(t)?t:null}function d(e){return"~"===e[0]?o.join(a.homedir(),e.slice(1)):e}let f={configDotenv:function(e){let t;let r=o.resolve(process.cwd(),".env"),a="utf8",s=!!(e&&e.debug);e&&e.encoding?a=e.encoding:s&&c("No encoding is specified. UTF-8 is used by default");let i=[r];if(e&&e.path){if(Array.isArray(e.path))for(let t of(i=[],e.path))i.push(d(t));else i=[d(e.path)]}let l={};for(let r of i)try{let t=f.parse(n.readFileSync(r,{encoding:a}));f.populate(l,t,e)}catch(e){s&&c(`Failed to load ${r} ${e.message}`),t=e}let p=process.env;return(e&&null!=e.processEnv&&(p=e.processEnv),f.populate(p,l,e),t)?{parsed:l,error:t}:{parsed:l}},_configVault:function(e){console.log(`[dotenv@${i}][INFO] Loading env from encrypted .env.vault`);let t=f._parseVault(e),r=process.env;return e&&null!=e.processEnv&&(r=e.processEnv),f.populate(r,t,e),{parsed:t}},_parseVault:function(e){let t;let r=u(e),n=f.configDotenv({path:r});if(!n.parsed){let e=Error(`MISSING_DATA: Cannot parse ${r} for an unknown reason`);throw e.code="MISSING_DATA",e}let o=p(e).split(","),a=o.length;for(let e=0;e<a;e++)try{let r=o[e].trim(),a=function(e,t){let r;try{r=new URL(t)}catch(e){if("ERR_INVALID_URL"===e.code){let e=Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");throw e.code="INVALID_DOTENV_KEY",e}throw e}let n=r.password;if(!n){let e=Error("INVALID_DOTENV_KEY: Missing key part");throw e.code="INVALID_DOTENV_KEY",e}let o=r.searchParams.get("environment");if(!o){let e=Error("INVALID_DOTENV_KEY: Missing environment part");throw e.code="INVALID_DOTENV_KEY",e}let a=`DOTENV_VAULT_${o.toUpperCase()}`,s=e.parsed[a];if(!s){let e=Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${a} in your .env.vault file.`);throw e.code="NOT_FOUND_DOTENV_ENVIRONMENT",e}return{ciphertext:s,key:n}}(n,r);t=f.decrypt(a.ciphertext,a.key);break}catch(t){if(e+1>=a)throw t}return f.parse(t)},config:function(e){if(0===p(e).length)return f.configDotenv(e);let t=u(e);if(!t){var r;return r=`You set DOTENV_KEY but you are missing a .env.vault file at ${t}. Did you forget to build it?`,console.log(`[dotenv@${i}][WARN] ${r}`),f.configDotenv(e)}return f._configVault(e)},decrypt:function(e,t){let r=Buffer.from(t.slice(-64),"hex"),n=Buffer.from(e,"base64"),o=n.subarray(0,12),a=n.subarray(-16);n=n.subarray(12,-16);try{let e=s.createDecipheriv("aes-256-gcm",r,o);return e.setAuthTag(a),`${e.update(n)}${e.final()}`}catch(n){let e=n instanceof RangeError,t="Invalid key length"===n.message,r="Unsupported state or unable to authenticate data"===n.message;if(e||t){let e=Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");throw e.code="INVALID_DOTENV_KEY",e}if(r){let e=Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");throw e.code="DECRYPTION_FAILED",e}throw n}},parse:function(e){let t;let r={},n=e.toString();for(n=n.replace(/\r\n?/mg,"\n");null!=(t=l.exec(n));){let e=t[1],n=t[2]||"",o=(n=n.trim())[0];n=n.replace(/^(['"`])([\s\S]*)\1$/mg,"$2"),'"'===o&&(n=(n=n.replace(/\\n/g,"\n")).replace(/\\r/g,"\r")),r[e]=n}return r},populate:function(e,t,r={}){let n=!!(r&&r.debug),o=!!(r&&r.override);if("object"!=typeof t){let e=Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");throw e.code="OBJECT_REQUIRED",e}for(let r of Object.keys(t))Object.prototype.hasOwnProperty.call(e,r)?(!0===o&&(e[r]=t[r]),n&&(!0===o?c(`"${r}" is already defined and WAS overwritten`):c(`"${r}" is already defined and was NOT overwritten`))):e[r]=t[r]}};e.exports.configDotenv=f.configDotenv,e.exports._configVault=f._configVault,e.exports._parseVault=f._parseVault,e.exports.config=f.config,e.exports.decrypt=f.decrypt,e.exports.parse=f.parse,e.exports.populate=f.populate,e.exports=f},7336:e=>{"use strict";e.exports=JSON.parse('{"name":"dotenv","version":"16.4.7","description":"Loads environment variables from .env file","main":"lib/main.js","types":"lib/main.d.ts","exports":{".":{"types":"./lib/main.d.ts","require":"./lib/main.js","default":"./lib/main.js"},"./config":"./config.js","./config.js":"./config.js","./lib/env-options":"./lib/env-options.js","./lib/env-options.js":"./lib/env-options.js","./lib/cli-options":"./lib/cli-options.js","./lib/cli-options.js":"./lib/cli-options.js","./package.json":"./package.json"},"scripts":{"dts-check":"tsc --project tests/types/tsconfig.json","lint":"standard","pretest":"npm run lint && npm run dts-check","test":"tap run --allow-empty-coverage --disable-coverage --timeout=60000","test:coverage":"tap run --show-full-coverage --timeout=60000 --coverage-report=lcov","prerelease":"npm test","release":"standard-version"},"repository":{"type":"git","url":"git://github.com/motdotla/dotenv.git"},"funding":"https://dotenvx.com","keywords":["dotenv","env",".env","environment","variables","config","settings"],"readmeFilename":"README.md","license":"BSD-2-Clause","devDependencies":{"@types/node":"^18.11.3","decache":"^4.6.2","sinon":"^14.0.1","standard":"^17.0.0","standard-version":"^9.5.0","tap":"^19.2.0","typescript":"^4.8.4"},"engines":{"node":">=12"},"browser":{"fs":false}}')}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),n=t.X(0,[638,452,238],()=>r(8324));module.exports=n})();