import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const endpoint = 'https://api.dmm.com/affiliate/v3/ItemList'
const apiId = process.env.DMM_API_ID || process.env.FANZA_API_ID
const affiliateId = process.env.DMM_AFFILIATE_ID || process.env.FANZA_AFFILIATE_ID
const outputDir = new URL('../output/work-catalog/', import.meta.url)
const jsonPath = new URL('works.json', outputDir)
const csvPath = new URL('works.csv', outputDir)
const relationPath = new URL('actress-works.json', outputDir)
const metaPath = new URL('metadata.json', outputDir)
const checkpointPath = new URL('.checkpoint.json', outputDir)
const hits = Math.min(100, Math.max(1, Number(process.env.DMM_ITEM_HITS || 100)))
const maxPages = Math.max(1, Number(process.env.DMM_ITEM_MAX_PAGES || 10000))
const delayMs = Math.max(250, Number(process.env.DMM_REQUEST_DELAY_MS || 750))
const site = process.env.DMM_API_SITE || 'FANZA'
const service = process.env.DMM_API_SERVICE || 'digital'
const floor = process.env.DMM_API_FLOOR || 'videoa'

if (!apiId || !affiliateId) { console.error('DMM_API_ID and DMM_AFFILIATE_ID are required.'); process.exit(1) }
const wait=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));const text=(v)=>v==null?'':String(v).trim();const csvCell=(v)=>`"${text(v).replaceAll('"','""')}"`;
async function readJson(path,fallback){try{return JSON.parse(await readFile(path,'utf8'))}catch{return fallback}}
async function atomicJson(path,value){const temp=new URL(`${path.pathname}.tmp`,path);await writeFile(temp,`${JSON.stringify(value,null,2)}\n`,'utf8');await rename(temp,path)}
function array(value){return Array.isArray(value)?value:[]}
function findJan(item){const candidates=[item.jan_code,item.jancode,item.jan,item.iteminfo?.jan_code,item.iteminfo?.jancode,...array(item.iteminfo?.product).map(v=>v.jan_code||v.jancode||v.jan)];return text(candidates.find(value=>/^\d{8,14}$/.test(text(value))))}
function normalize(item){const actresses=array(item.iteminfo?.actress||item.iteminfo?.actor).map(value=>({id:text(value.id),name:text(value.name)})).filter(value=>value.id||value.name);const makers=array(item.iteminfo?.maker);const genres=array(item.iteminfo?.genre);const jan=findJan(item);const contentId=text(item.content_id);const productId=text(item.product_id||item.dmm_id);return{id:contentId||productId||jan,title:text(item.title),jan,identifierType:jan?'JAN':contentId?'CONTENT_ID':'PRODUCT_ID',primaryIdentifier:jan||contentId||productId,contentId,productId,actresses,makerId:text(makers[0]?.id),makerName:text(makers[0]?.name),genres:genres.map(v=>text(v.name)).filter(Boolean),date:text(item.date),price:Number(item.prices?.price)||null,officialUrl:text(item.URL),affiliateUrl:text(item.affiliateURL),imageUrl:text(item.imageURL?.large||item.imageURL?.list),source:'DMM Affiliate API v3 ItemList',observedAt:new Date().toISOString()}}
async function fetchPage(offset,attempt=0){const params=new URLSearchParams({api_id:apiId,affiliate_id:affiliateId,site,service,floor,hits:String(hits),offset:String(offset),sort:'date',output:'json'});try{const response=await fetch(`${endpoint}?${params}`,{headers:{accept:'application/json'}});if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json()}catch(error){if(attempt>=4)throw error;const backoff=delayMs*(2**attempt);console.warn(`offset ${offset} failed; retry in ${backoff}ms`);await wait(backoff);return fetchPage(offset,attempt+1)}}
await mkdir(outputDir,{recursive:true});const resume=process.env.DMM_RESUME!=='false';const existing=resume?await readJson(jsonPath,[]):[];const byId=new Map(existing.filter(row=>row.id).map(row=>[row.id,row]));const checkpoint=resume?await readJson(checkpointPath,null):null;let offset=Math.max(1,Number(checkpoint?.nextOffset)||1),pages=0,totalCount=null;
while(pages<maxPages){const body=await fetchPage(offset);const rows=body.result?.items||[];totalCount=Number(body.result?.total_count)||totalCount;for(const item of rows){const record=normalize(item);if(record.id)byId.set(record.id,{...byId.get(record.id),...record})}pages+=1;offset+=rows.length;const records=[...byId.values()];await atomicJson(jsonPath,records);await atomicJson(checkpointPath,{nextOffset:offset,pagesFetched:pages,records:records.length,totalCount,site,service,floor,updatedAt:new Date().toISOString()});console.log(`page=${pages} offset=${offset} works=${records.length} total=${totalCount??'?'}`);if(rows.length<hits||(totalCount&&offset>totalCount))break;await wait(delayMs)}
const records=[...byId.values()].sort((a,b)=>b.date.localeCompare(a.date)||a.title.localeCompare(b.title,'ja'));const columns=['id','title','jan','identifierType','primaryIdentifier','contentId','productId','makerId','makerName','date','price','officialUrl','affiliateUrl','imageUrl','source','observedAt'];const csv=[`\uFEFF${columns.map(csvCell).join(',')}`,...records.map(row=>columns.map(key=>csvCell(row[key])).join(','))].join('\r\n');await writeFile(csvPath,`${csv}\r\n`,'utf8');const relations=records.flatMap(work=>work.actresses.map(actress=>({actressId:actress.id,actressName:actress.name,workId:work.id,jan:work.jan,contentId:work.contentId,productId:work.productId,observedAt:work.observedAt})));await atomicJson(relationPath,relations);await atomicJson(metaPath,{schemaVersion:2,generatedAt:new Date().toISOString(),source:endpoint,officialApiOnly:true,site,service,floor,records:records.length,withJan:records.filter(row=>row.jan).length,relations:relations.length,totalCount,sha256:createHash('sha256').update(JSON.stringify(records)).digest('hex'),note:'Digital works may not have a JAN. contentId and productId are preserved as fallback identifiers.'});console.log(`Completed: ${records.length} works, ${relations.length} actress relations, ${records.filter(row=>row.jan).length} JAN codes.`)
