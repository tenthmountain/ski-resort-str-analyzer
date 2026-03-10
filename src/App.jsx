import { useState, useMemo, useCallback, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Area, Line } from "recharts";

const MARKETS = [
  { id:"breck", name:"Breckenridge", state:"CO", lat:39.4817, lng:-106.0384,
    medianPrice:{studio:385000,"1br":525000,"2br":725000,"3br":1050000,"4br":1650000},
    adr:{studio:195,"1br":265,"2br":385,"3br":520,"4br":725},
    occupancy:{annual:0.58}, propertyTaxRate:0.0052, hoaAvg:450, insuranceRate:0.005,
    seasonality:[.78,.82,.80,.55,.32,.45,.62,.58,.42,.35,.48,.72],
    notes:"Strong year-round. Summer festivals + hiking." },
  { id:"steamboat", name:"Steamboat Springs", state:"CO", lat:40.4850, lng:-106.8317,
    medianPrice:{studio:325000,"1br":445000,"2br":625000,"3br":875000,"4br":1350000},
    adr:{studio:175,"1br":240,"2br":350,"3br":475,"4br":650},
    occupancy:{annual:0.54}, propertyTaxRate:0.0048, hoaAvg:380, insuranceRate:0.0048,
    seasonality:[.75,.78,.76,.50,.28,.42,.58,.55,.38,.30,.45,.68],
    notes:"Champagne Powder. Lower entry vs Summit." },
  { id:"vail", name:"Vail / Avon", state:"CO", lat:39.6403, lng:-106.3742,
    medianPrice:{studio:525000,"1br":725000,"2br":1100000,"3br":1650000,"4br":2800000},
    adr:{studio:245,"1br":335,"2br":485,"3br":675,"4br":950},
    occupancy:{annual:0.61}, propertyTaxRate:0.0045, hoaAvg:650, insuranceRate:0.005,
    seasonality:[.82,.85,.83,.58,.35,.48,.65,.60,.45,.38,.52,.76],
    notes:"Premium. High ADR but high entry." },
  { id:"winterpark", name:"Winter Park", state:"CO", lat:39.8868, lng:-105.7625,
    medianPrice:{studio:295000,"1br":395000,"2br":545000,"3br":775000,"4br":1150000},
    adr:{studio:155,"1br":215,"2br":310,"3br":425,"4br":585},
    occupancy:{annual:0.51}, propertyTaxRate:0.0055, hoaAvg:320, insuranceRate:0.0048,
    seasonality:[.72,.75,.73,.48,.26,.38,.55,.50,.36,.28,.42,.65],
    notes:"Best value CO. Amtrak from Denver." },
  { id:"telluride", name:"Telluride", state:"CO", lat:37.9375, lng:-107.8123,
    medianPrice:{studio:475000,"1br":650000,"2br":975000,"3br":1450000,"4br":2400000},
    adr:{studio:225,"1br":310,"2br":450,"3br":625,"4br":875},
    occupancy:{annual:0.56}, propertyTaxRate:0.0042, hoaAvg:550, insuranceRate:0.005,
    seasonality:[.76,.80,.78,.52,.30,.44,.60,.56,.40,.32,.46,.70],
    notes:"Luxury market. Film fest summer." },
  { id:"crestedbutte", name:"Crested Butte", state:"CO", lat:38.8697, lng:-106.9878,
    medianPrice:{studio:365000,"1br":495000,"2br":695000,"3br":975000,"4br":1500000},
    adr:{studio:185,"1br":250,"2br":365,"3br":495,"4br":680},
    occupancy:{annual:0.52}, propertyTaxRate:0.0050, hoaAvg:375, insuranceRate:0.0048,
    seasonality:[.73,.76,.74,.48,.27,.40,.56,.52,.37,.29,.44,.66],
    notes:"Emerging. Wildflower festival." },
  { id:"keystone", name:"Keystone", state:"CO", lat:39.6069, lng:-105.9497,
    medianPrice:{studio:340000,"1br":465000,"2br":650000,"3br":925000,"4br":1400000},
    adr:{studio:170,"1br":235,"2br":340,"3br":465,"4br":640},
    occupancy:{annual:0.53}, propertyTaxRate:0.0052, hoaAvg:400, insuranceRate:0.005,
    seasonality:[.74,.77,.75,.50,.28,.40,.57,.53,.38,.30,.44,.67],
    notes:"River Run Village condos." },
  { id:"stowe", name:"Stowe", state:"VT", lat:44.4654, lng:-72.6874,
    medianPrice:{studio:285000,"1br":375000,"2br":525000,"3br":725000,"4br":1100000},
    adr:{studio:165,"1br":225,"2br":325,"3br":445,"4br":615},
    occupancy:{annual:0.55}, propertyTaxRate:0.0195, hoaAvg:250, insuranceRate:0.004,
    seasonality:[.76,.80,.72,.48,.30,.42,.55,.52,.52,.48,.40,.68],
    notes:"VT premium. Fall foliage shoulder." },
  { id:"killington", name:"Killington", state:"VT", lat:43.6045, lng:-72.8201,
    medianPrice:{studio:215000,"1br":295000,"2br":415000,"3br":585000,"4br":850000},
    adr:{studio:145,"1br":195,"2br":285,"3br":385,"4br":530},
    occupancy:{annual:0.51}, propertyTaxRate:0.0185, hoaAvg:200, insuranceRate:0.0038,
    seasonality:[.72,.76,.68,.44,.24,.35,.48,.45,.48,.44,.36,.64],
    notes:"Best value VT. Longest season East." },
  { id:"sugarbush", name:"Sugarbush", state:"VT", lat:44.1358, lng:-72.9004,
    medianPrice:{studio:195000,"1br":265000,"2br":375000,"3br":525000,"4br":775000},
    adr:{studio:135,"1br":185,"2br":265,"3br":360,"4br":495},
    occupancy:{annual:0.48}, propertyTaxRate:0.0190, hoaAvg:175, insuranceRate:0.0038,
    seasonality:[.68,.72,.66,.42,.22,.32,.45,.42,.45,.42,.34,.60],
    notes:"Lowest entry. Mad River Valley." },
  { id:"stratton", name:"Stratton", state:"VT", lat:43.1134, lng:-72.9076,
    medianPrice:{studio:245000,"1br":335000,"2br":465000,"3br":650000,"4br":975000},
    adr:{studio:155,"1br":210,"2br":305,"3br":415,"4br":570},
    occupancy:{annual:0.49}, propertyTaxRate:0.0188, hoaAvg:225, insuranceRate:0.0038,
    seasonality:[.70,.74,.66,.44,.23,.34,.46,.44,.46,.42,.35,.62],
    notes:"NYC weekend warriors." },
  { id:"jaypeak", name:"Jay Peak", state:"VT", lat:48.9434, lng:-72.5259,
    medianPrice:{studio:155000,"1br":215000,"2br":305000,"3br":435000,"4br":625000},
    adr:{studio:115,"1br":155,"2br":225,"3br":305,"4br":420},
    occupancy:{annual:0.44}, propertyTaxRate:0.0180, hoaAvg:150, insuranceRate:0.0035,
    seasonality:[.66,.70,.64,.38,.18,.28,.40,.38,.38,.35,.30,.58],
    notes:"Lowest entry in dataset. Waterpark." },
  { id:"mountsnow", name:"Mount Snow", state:"VT", lat:42.9601, lng:-72.9209,
    medianPrice:{studio:225000,"1br":305000,"2br":425000,"3br":595000,"4br":875000},
    adr:{studio:140,"1br":190,"2br":275,"3br":375,"4br":515},
    occupancy:{annual:0.48}, propertyTaxRate:0.0186, hoaAvg:200, insuranceRate:0.0038,
    seasonality:[.69,.73,.65,.43,.22,.33,.45,.43,.45,.42,.34,.61],
    notes:"Closest VT to NYC. Epic Pass." },
  { id:"manchester", name:"Manchester", state:"VT", lat:43.1631, lng:-73.0723,
    medianPrice:{studio:205000,"1br":280000,"2br":395000,"3br":550000,"4br":825000},
    adr:{studio:130,"1br":175,"2br":255,"3br":350,"4br":480},
    occupancy:{annual:0.46}, propertyTaxRate:0.0192, hoaAvg:175, insuranceRate:0.0038,
    seasonality:[.66,.70,.62,.40,.22,.35,.48,.46,.50,.46,.34,.58],
    notes:"Bromley + Stratton access. Outlet shopping year-round." },
  { id:"jackson", name:"Jackson", state:"WY", lat:43.4799, lng:-110.7624,
    medianPrice:{studio:495000,"1br":675000,"2br":975000,"3br":1450000,"4br":2350000},
    adr:{studio:265,"1br":365,"2br":525,"3br":725,"4br":1050},
    occupancy:{annual:0.62}, propertyTaxRate:0.0058, hoaAvg:550, insuranceRate:0.0045,
    seasonality:[.82,.86,.84,.58,.35,.55,.72,.70,.52,.38,.48,.76],
    notes:"Trophy market. JHMR + Grand Teton NP. Massive summer." },
  { id:"driggs", name:"Driggs", state:"ID", lat:43.7233, lng:-111.1111,
    medianPrice:{studio:275000,"1br":365000,"2br":495000,"3br":695000,"4br":1050000},
    adr:{studio:155,"1br":215,"2br":310,"3br":425,"4br":595},
    occupancy:{annual:0.50}, propertyTaxRate:0.0072, hoaAvg:225, insuranceRate:0.004,
    seasonality:[.72,.76,.74,.48,.25,.42,.58,.56,.40,.32,.40,.66],
    notes:"Grand Targhee. Jackson overflow value play." },
  { id:"frisco", name:"Frisco", state:"CO", lat:39.5744, lng:-106.0975,
    medianPrice:{studio:355000,"1br":485000,"2br":675000,"3br":975000,"4br":1500000},
    adr:{studio:180,"1br":250,"2br":360,"3br":495,"4br":685},
    occupancy:{annual:0.56}, propertyTaxRate:0.0052, hoaAvg:400, insuranceRate:0.005,
    seasonality:[.76,.80,.78,.54,.30,.44,.60,.56,.42,.34,.46,.70],
    notes:"Summit County hub. Copper + Breck + Keystone + A-Basin." },
  { id:"dillon", name:"Dillon", state:"CO", lat:39.6311, lng:-106.0436,
    medianPrice:{studio:310000,"1br":425000,"2br":595000,"3br":850000,"4br":1300000},
    adr:{studio:165,"1br":225,"2br":325,"3br":445,"4br":615},
    occupancy:{annual:0.52}, propertyTaxRate:0.0052, hoaAvg:350, insuranceRate:0.005,
    seasonality:[.74,.78,.76,.52,.28,.42,.58,.54,.40,.32,.44,.68],
    notes:"Dillon Reservoir. Lower entry vs Frisco/Breck." },
];

const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const PT=["studio","1br","2br","3br","4br"];
const PL={studio:"Studio","1br":"1 Bed","2br":"2 Bed","3br":"3 Bed","4br":"4 Bed"};
const fmt=(n,d=0)=>n.toLocaleString("en-US",{maximumFractionDigits:d});
const fmtC=(n,d=0)=>"$"+fmt(Math.abs(n),d);
const fmtCF=(n,d=0)=>(n>=0?"+$":"-$")+fmt(Math.abs(n),d);

const DAYS=[31,28,31,30,31,30,31,31,30,31,30,31];
const PEAK_IDX=new Set([11,0,1,2]); // Dec,Jan,Feb,Mar
const PEAK_DAYS=DAYS[11]+DAYS[0]+DAYS[1]+DAYS[2]; // 122
const OFF_DAYS=365-PEAK_DAYS; // 243

function calcCF(m,pt,ov={}){
  const pp=ov.purchasePrice||m.medianPrice[pt],dp=ov.downPct||0.25,ir=ov.rate||0.072;
  const baseAdr=ov.adr||m.adr[pt],occ=ov.occ||m.occupancy.annual,mgmt=ov.mgmt||0.20;
  const clean=pt==="studio"?85:pt==="1br"?110:pt==="2br"?145:pt==="3br"?185:225;
  const peakPersonal=ov.peakPersonal??10,offPersonal=ov.offPersonal??4;
  const totalPersonal=peakPersonal+offPersonal;
  const loan=pp*(1-dp),mr=ir/12;
  const mo=loan*(mr*Math.pow(1+mr,360))/(Math.pow(1+mr,360)-1);

  // Seasonal ADR: scale base ADR by each month's relative demand
  const avgSeas=m.seasonality.reduce((a,b)=>a+b,0)/12;

  // Monthly calculation
  let totalNights=0,totalGross=0,totalTurns=0;
  const monthly=m.seasonality.map((s,i)=>{
    const isPeak=PEAK_IDX.has(i);
    const baseDays=DAYS[i];
    // Spread personal nights proportionally across their season's months
    const persShare=isPeak?(peakPersonal*baseDays/PEAK_DAYS):(offPersonal*baseDays/OFF_DAYS);
    const availDays=Math.max(0,baseDays-persShare);
    const booked=availDays*s*0.95;
    const monthAdr=baseAdr*(s/avgSeas); // ADR scales with seasonal demand
    const turns=booked/3.5;
    const rev=booked*monthAdr+turns*clean*0.5;
    totalNights+=booked; totalGross+=rev; totalTurns+=turns;
    return{month:MONTHS[i],booked:Math.round(booked),adr:Math.round(monthAdr),revenue:Math.round(rev),
      persNights:Math.round(persShare*10)/10,availDays:Math.round(availDays),occ:Math.round(s*100),isPeak};
  });

  const expenses=totalGross*mgmt+totalTurns*clean+pp*m.propertyTaxRate+pp*m.insuranceRate+m.hoaAvg*12+pp*0.01
    +(pt==="studio"?1800:pt==="1br"?2400:pt==="2br"?3200:pt==="3br"?4000:5000)+totalGross*0.03+totalNights*8+150;
  const noi=totalGross-expenses,cf=noi-mo*12;
  const cashIn=pp*dp+pp*0.03+(pt==="studio"?8000:pt==="1br"?12000:pt==="2br"?18000:pt==="3br"?25000:35000);

  // Calculate revenue displaced by personal use (vs if those nights were rented)
  const peakAvgSeas=m.seasonality.filter((_,i)=>PEAK_IDX.has(i)).reduce((a,b)=>a+b,0)/4;
  const offAvgSeas=m.seasonality.filter((_,i)=>!PEAK_IDX.has(i)).reduce((a,b)=>a+b,0)/8;
  const peakAdr=baseAdr*(peakAvgSeas/avgSeas);
  const offAdr=baseAdr*(offAvgSeas/avgSeas);
  const displaced=peakPersonal*peakAdr*peakAvgSeas*0.95 + offPersonal*offAdr*offAvgSeas*0.95;

  // Enrich monthly with expenses/mortgage for chart
  monthly.forEach(mo2=>{mo2.expenses=Math.round(expenses/12);mo2.mortgage=Math.round(mo);mo2.cashFlow=Math.round(mo2.revenue-expenses/12-mo);});

  return{pp,adr:baseAdr,occ,gross:totalGross,expenses,noi,mortgage:mo*12,cf,monthlyCF:cf/12,cashIn,
    coc:(cf/cashIn)*100,capRate:(noi/pp)*100,grossYield:(totalGross/pp)*100,monthly,nights:totalNights,
    peakPersonal,offPersonal,totalPersonal,displaced,peakAdr:Math.round(peakAdr),offAdr:Math.round(offAdr)};
}

// ── RapidAPI hosts ────────────────────────────────────────────────────────────
// All three confirmed subscribed. Same key works for all.
const RH={
  zil:"private-zillow.p.rapidapi.com",                        // property for-sale listings
  air:"airbnb-market-rental-intelligence-api.p.rapidapi.com", // live Airbnb listings + rates
  adn:"airdna1.p.rapidapi.com",                               // STR market analytics
};

// Default key pre-loaded — user can override via the UI input
const DEFAULT_KEY="324bb62945msh0c1c9f8832417e3p1b54f5jsn40aed8c43385";

async function api(host,path,params,key){
  const url=new URL(`https://${host}${path}`);
  Object.entries(params).forEach(([k,v])=>{if(v!=null)url.searchParams.set(k,String(v))});
  let r;
  try{r=await fetch(url,{headers:{"x-rapidapi-key":key,"x-rapidapi-host":host}});}
  catch(e){throw new Error("Network/CORS error — run locally (npm run dev) or deploy to Vercel");}
  if(!r.ok){
    const msg=r.status===401||r.status===403?`Not subscribed to "${host}" on RapidAPI — visit rapidapi.com to subscribe`
             :r.status===429?"Rate limit exceeded — upgrade your RapidAPI plan or wait a moment"
             :r.status===404?`404 on ${host}${path} — wrong endpoint path`
             :`HTTP ${r.status} from ${host}${path}`;
    throw new Error(msg);
  }
  return r.json();
}
const tryApi=async(src,fn)=>{try{return{source:src,data:await fn()}}catch(e){return{source:src,error:e.message}}};

// Try multiple endpoint paths, return first that doesn't 404/error. Attaches .endpoint to result.
async function tryEndpoints(src,host,paths,paramsFn,key){
  for(const path of paths){
    const params=paramsFn(path);
    const r=await tryApi(src,()=>api(host,path,params,key));
    if(!r.error||!r.error.includes("404")){return{...r,endpoint:path};}
  }
  return{source:src,error:`No working endpoint found on ${host}. Tried: ${paths.join(", ")}`,endpoint:null};
}

// AirDNA requires a 2-step flow:
//   1. market/search → get market_id
//   2. parallel calls for occupancy + ADR + revenue
// Falls back to rentalizer (lat/lng, single call) if market search fails.
async function fetchAirDNA(city,state,lat,lng,key){
  // Dates: last 12 months
  const d=new Date();
  const end=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  const ds=new Date(d);ds.setFullYear(ds.getFullYear()-1);
  const start=`${ds.getFullYear()}-${String(ds.getMonth()+1).padStart(2,"0")}`;

  // ── Option A: Rentalizer (lat/lng, single call, returns occ+ADR+revenue) ──
  const RENTALIZER_PATHS=[
    "/api/enterprise/v2/rentalizer/estimate",
    "/rentalizer/estimate","/rentalizer","/v2/rentalizer",
  ];
  for(const path of RENTALIZER_PATHS){
    const rz=await tryApi("airdna",()=>api(RH.adn,path,{lat:String(lat),lng:String(lng),bedrooms:"2",bathrooms:"2",currency:"USD"},key));
    if(!rz.error){return{...rz,endpoint:path,mode:"rentalizer"};}
    if(rz.error.includes("subscri")||rz.error.includes("403"))return{source:"airdna",error:rz.error,endpoint:path};
  }

  // ── Option B: Market search → occupancy + ADR + revenue ──
  const MARKET_SEARCH_PATHS=[
    "/api/enterprise/v2/market/search","/market/search","/v2/market/search","/search",
  ];
  let marketId=null, searchEndpoint=null;
  for(const path of MARKET_SEARCH_PATHS){
    const ms=await tryApi("airdna",()=>api(RH.adn,path,{search_term:`${city}, ${state}`},key));
    if(!ms.error){
      const arr=ms.data?.markets||ms.data?.results||ms.data?.data||(Array.isArray(ms.data)?ms.data:[]);
      const first=Array.isArray(arr)?arr[0]:arr;
      marketId=first?.market_id||first?.id||null;
      if(marketId){searchEndpoint=path;break;}
    }
    if(ms.error?.includes("subscri")||ms.error?.includes("403"))return{source:"airdna",error:ms.error,endpoint:path};
  }
  if(!marketId)return{source:"airdna",error:"AirDNA: could not find market ID. Try the rentalizer estimate endpoint.",endpoint:searchEndpoint};

  const OCC_PATHS=["/api/enterprise/v2/market/occupancy","/market/occupancy","/v2/market/occupancy"];
  const ADR_PATHS=["/api/enterprise/v2/market/adr","/market/adr","/v2/market/adr"];
  const REV_PATHS=["/api/enterprise/v2/market/revenue","/market/revenue","/v2/market/revenue"];
  const p={market_id:String(marketId),start_date:start,end_date:end};

  const [occ,adrD,revD]=await Promise.all([
    (async()=>{for(const ph of OCC_PATHS){const r=await tryApi("occ",()=>api(RH.adn,ph,p,key));if(!r.error)return r;}return{error:"occ unavail"}})(),
    (async()=>{for(const ph of ADR_PATHS){const r=await tryApi("adr",()=>api(RH.adn,ph,p,key));if(!r.error)return r;}return{error:"adr unavail"}})(),
    (async()=>{for(const ph of REV_PATHS){const r=await tryApi("rev",()=>api(RH.adn,ph,p,key));if(!r.error)return r;}return{error:"rev unavail"}})(),
  ]);

  return{source:"airdna",data:{marketId,occupancy:occ?.data,adr:adrD?.data,revenue:revD?.data},endpoint:`${searchEndpoint}→market/[occ|adr|rev]`,mode:"market"};
}

const C={green:"#34d399",red:"#f87171",blue:"#63b3ed",yellow:"#fbbf24",purple:"#a78bfa",orange:"#fb923c",cyan:"#22d3ee"};
const stClr=(st)=>st==="CO"?C.blue:st==="VT"?C.green:st==="WY"?C.orange:C.cyan;
const crd={background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"12px 14px"};

const Metric=({label,value,sub,color})=>(
  <div style={crd}>
    <div style={{fontSize:10,color:"#7a8ba5",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3}}>{label}</div>
    <div style={{fontSize:18,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:color||"#e8edf5",wordBreak:"break-all"}}>{value}</div>
    {sub&&<div style={{fontSize:10,color:"#556178",marginTop:2}}>{sub}</div>}
  </div>
);
const Btn=({children,active,onClick,color})=>(
  <button onClick={onClick} style={{padding:"5px 11px",borderRadius:7,border:"1px solid",borderColor:active?`${color||C.blue}55`:"rgba(255,255,255,0.08)",background:active?`${color||C.blue}18`:"rgba(255,255,255,0.03)",color:active?color||C.blue:"#7a8ba5",cursor:"pointer",fontSize:12,fontWeight:500,whiteSpace:"nowrap",flexShrink:0}}>{children}</button>
);
const Slider=({label,value,onChange,min,max,step,format})=>(
  <div style={{flex:"1 1 120px",minWidth:100}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
      <span style={{fontSize:10,color:"#7a8ba5"}}>{label}</span>
      <span style={{fontSize:10,color:"#e8edf5",fontFamily:"'JetBrains Mono',monospace",fontWeight:600}}>{format?format(value):value}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(parseFloat(e.target.value))} style={{width:"100%",accentColor:C.blue,height:3}}/>
  </div>
);
const Badge=({text,color})=>(<span style={{fontSize:9,fontWeight:600,padding:"2px 6px",borderRadius:4,background:`${color}22`,color}}>{text}</span>);
const KV=({label,value,color,bold,sep})=>sep?(<div style={{borderTop:`1px solid ${color||"rgba(255,255,255,0.08)"}`,margin:"3px 0"}}/>):(
  <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0",gap:8,borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
    <span style={{fontSize:11,color:bold?color:"#8a9bb5",fontWeight:bold?700:400}}>{label}</span>
    <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:bold?color:"#e8edf5",fontWeight:bold?700:400,flexShrink:0}}>{value}</span>
  </div>
);
const Status=({results,loading})=>{
  if(loading)return <div style={{fontSize:11,color:C.blue}}>Fetching...</div>;
  if(!results?.length)return null;
  return(<div style={{display:"flex",gap:4,fontSize:10,flexWrap:"wrap"}}>{results.map((r,i)=>(<span key={i} style={{padding:"2px 6px",borderRadius:4,background:r.error?"rgba(248,113,113,0.1)":"rgba(52,211,153,0.1)",color:r.error?C.red:C.green}}>{r.source}{r.error?" ✗":" ✓"}</span>))}</div>);
};

export default function App(){
  const[apiKey,setApiKey]=useState(DEFAULT_KEY);
  const[apiIn,setApiIn]=useState(DEFAULT_KEY);
  const[view,setView]=useState("markets");
  const[selId,setSelId]=useState(null);
  const[pt,setPt]=useState("2br");
  const[sf,setSf]=useState("all");
  const[sort,setSort]=useState("coc");
  const[ov,setOv]=useState({downPct:0.25,rate:0.072,mgmt:0.20,peakPersonal:10,offPersonal:4});
  const[apiRes,setApiRes]=useState({});
  const[ld,setLd]=useState({});
  const[addr,setAddr]=useState("");
  const[liveMarket,setLiveMarket]=useState(MARKETS[0].id);
  const[debugMode,setDebugMode]=useState(false);
  const sO=(k,v)=>setOv(p=>({...p,[k]:v}));

  const analysis=useMemo(()=>MARKETS.map(m=>({...m,cf:calcCF(m,pt,ov)})),[pt,ov]);
  const filtered=useMemo(()=>{
    let f=analysis;if(sf!=="all")f=f.filter(m=>m.state===sf);
    f.sort((a,b)=>sort==="coc"?b.cf.coc-a.cf.coc:sort==="cap"?b.cf.capRate-a.cf.capRate:sort==="cf"?b.cf.cf-a.cf.cf:sort==="price"?a.cf.pp-b.cf.pp:b.cf.grossYield-a.cf.grossYield);
    return f;
  },[analysis,sf,sort]);
  const sel=selId?analysis.find(m=>m.id===selId):null;

  const fetchMkt=useCallback(async(m)=>{
    if(!apiKey)return;
    setLd(p=>({...p,[m.id]:true}));
    const city=m.name.replace(/ \/.*/,"");
    const loc=`${city}, ${m.state}`;
    // Airbnb date window: ~30 days out, 3-night stay
    const d0=new Date();d0.setDate(d0.getDate()+30);
    const d1=new Date(d0);d1.setDate(d1.getDate()+3);
    const fd=d=>d.toISOString().split("T")[0];
    const ci=fd(d0),co=fd(d1);
    const res=await Promise.all([
      // 1. private-zillow — try multiple known endpoint paths
      tryEndpoints("zillow",RH.zil,[
        "/search","/propertyExtendedSearch","/forsaleByHomeType",
        "/properties/list","/v2/search","/searchByUrl",
      ],path=>({location:loc,page:"1"}),apiKey),
      // 2. Airbnb Market & Rental Intelligence — per API docs, /search is primary
      tryEndpoints("airbnb",RH.air,[
        "/search","/api/v1/searchPropertyByPlace","/listings",
        "/search-listings","/v2/search","/market","/properties",
      ],path=>({location:loc,checkin:ci,checkout:co,adults:"2",currency:"USD",page:"1"}),apiKey),
      // 3. AirDNA — 2-step: market/search → occupancy+ADR+revenue (or rentalizer)
      fetchAirDNA(city,m.state,m.lat,m.lng,apiKey),
    ]);
    setApiRes(p=>({...p,[m.id]:res}));
    setLd(p=>({...p,[m.id]:false}));
  },[apiKey]);

  const searchAddr=useCallback(async()=>{
    if(!apiKey||!addr)return;
    setLd(p=>({...p,a:true}));
    const res=await Promise.all([
      tryEndpoints("zillow",RH.zil,[
        "/search","/propertyExtendedSearch","/forsaleByHomeType",
        "/properties/list","/v2/search",
      ],()=>({location:addr,page:"1"}),apiKey),
    ]);
    setApiRes(p=>({...p,a:res}));
    setLd(p=>({...p,a:false}));
  },[apiKey,addr]);

  const mR=sel?apiRes[sel.id]:null;

  // Auto-fetch when user opens the Live tab and has a key — defined after
  // fetchMkt so the closure captures the correct (stable) reference.
  useEffect(()=>{
    if(view==="live"&&apiKey){
      const m=MARKETS.find(m=>m.id===liveMarket);
      if(m&&!apiRes[liveMarket]&&!ld[liveMarket])fetchMkt(m);
    }
  },[view,apiKey,liveMarket,fetchMkt]);  // fetchMkt stable — only changes when apiKey changes

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(145deg,#080c16 0%,#0f1729 40%,#0c1322 100%)",color:"#e8edf5",fontFamily:"'DM Sans',-apple-system,sans-serif",overflowX:"hidden",width:"100%"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
        input[type="range"]{-webkit-appearance:none;background:rgba(255,255,255,0.1);border-radius:2px;outline:none;height:3px}
        input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;background:${C.blue};border-radius:50%;cursor:pointer}
        input[type="text"],input[type="password"]{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px 12px;color:#e8edf5;font-size:13px;outline:none;font-family:inherit;width:100%;min-width:0}
        input:focus{border-color:rgba(99,179,237,0.4)!important}
        .sr{display:flex;gap:5px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:2px}
        .sr::-webkit-scrollbar{display:none}
        .gm{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
        .g2{display:grid;grid-template-columns:1fr;gap:10px}
        .g3{display:grid;grid-template-columns:1fr;gap:10px}
        .gs{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}
        @media(min-width:480px){.gm{grid-template-columns:repeat(3,1fr)}.gs{grid-template-columns:repeat(4,1fr)}}
        @media(min-width:640px){.g2{grid-template-columns:1fr 1fr}.gs{grid-template-columns:repeat(7,1fr)}}
        @media(min-width:768px){.gm{grid-template-columns:repeat(5,1fr)}}
        @media(min-width:900px){.g3{grid-template-columns:1fr 1fr 1fr}}
      `}</style>

      {/* HEADER */}
      <div style={{padding:"14px 12px 10px",borderBottom:"1px solid rgba(255,255,255,0.06)",background:"rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
          <span style={{fontSize:16}}>⛷️</span>
          <h1 style={{fontSize:16,fontWeight:700}}>Ski Resort Airbnb Analyzer</h1>
          <Badge text={apiKey?"LIVE":"OFFLINE"} color={apiKey?C.green:C.yellow}/>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:10}}>
          <input type="password" placeholder="RapidAPI Key" value={apiIn} onChange={e=>setApiIn(e.target.value)}/>
          <button onClick={()=>setApiKey(apiIn)} style={{padding:"7px 12px",borderRadius:8,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,flexShrink:0,background:apiKey?C.green:C.blue,color:"#0a0e1a"}}>{apiKey?"✓":"Connect"}</button>
        </div>
        <div className="sr" style={{marginBottom:6}}>
          {[["markets","📊 Markets"],["detail","🔍 Analyzer"],["live","🔴 Live"],["seasonal","📈 Seasons"]].map(([v,l])=><Btn key={v} active={view===v} onClick={()=>setView(v)}>{l}</Btn>)}
        </div>
        <div className="sr">
          {PT.map(t=><Btn key={t} active={pt===t} onClick={()=>setPt(t)}>{PL[t]}</Btn>)}
        </div>
      </div>

      {/* CONTROLS */}
      <div style={{padding:"8px 12px",background:"rgba(0,0,0,0.12)",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
        <div className="sr" style={{marginBottom:6}}>
          {[["all","All"],["CO","CO"],["VT","VT"],["WY","WY"],["ID","ID"]].map(([v,l])=><Btn key={v} active={sf===v} onClick={()=>setSf(v)}>{l}</Btn>)}
          <div style={{width:6,flexShrink:0}}/>
          {[["coc","CoC"],["cap","Cap"],["cf","CF"],["yield","Yield"],["price","Price↑"]].map(([v,l])=><Btn key={v} active={sort===v} onClick={()=>setSort(v)}>{l}</Btn>)}
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <Slider label="Down" value={ov.downPct} onChange={v=>sO("downPct",v)} min={0.1} max={1} step={0.05} format={v=>`${Math.round(v*100)}%`}/>
          <Slider label="Rate" value={ov.rate} onChange={v=>sO("rate",v)} min={0.05} max={0.10} step={0.001} format={v=>`${(v*100).toFixed(1)}%`}/>
          <Slider label="Mgmt" value={ov.mgmt} onChange={v=>sO("mgmt",v)} min={0} max={0.30} step={0.01} format={v=>`${Math.round(v*100)}%`}/>
          <Slider label="Peak Use" value={ov.peakPersonal} onChange={v=>sO("peakPersonal",v)} min={0} max={40} step={1} format={v=>`${v}nt`}/>
          <Slider label="Off-Pk Use" value={ov.offPersonal} onChange={v=>sO("offPersonal",v)} min={0} max={40} step={1} format={v=>`${v}nt`}/>
        </div>
      </div>

      {/* MARKETS */}
      {view==="markets"&&(
        <div style={{padding:"14px 12px"}}>
          <div className="gm" style={{marginBottom:14}}>
            <Metric label="Markets" value={filtered.length} sub={`${filtered.filter(m=>m.cf.cf>0).length} pos CF`}/>
            <Metric label="Best CoC" value={`${Math.max(...filtered.map(m=>m.cf.coc)).toFixed(1)}%`} sub={filtered.reduce((a,b)=>a.cf.coc>b.cf.coc?a:b).name} color={C.green}/>
            <Metric label="Best Cap" value={`${Math.max(...filtered.map(m=>m.cf.capRate)).toFixed(1)}%`} sub={filtered.reduce((a,b)=>a.cf.capRate>b.cf.capRate?a:b).name} color={C.green}/>
            <Metric label="Best CF/mo" value={fmtCF(Math.max(...filtered.map(m=>m.cf.monthlyCF)))} sub={filtered.reduce((a,b)=>a.cf.monthlyCF>b.cf.monthlyCF?a:b).name} color={C.green}/>
            <Metric label="Low Entry" value={fmtC(Math.min(...filtered.map(m=>m.cf.pp)))} sub={filtered.reduce((a,b)=>a.cf.pp<b.cf.pp?a:b).name} color={C.blue}/>
          </div>
          <div style={{...crd,marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:600,marginBottom:10,color:"#8a9bb5"}}>CoC vs Cap Rate</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={filtered.map(m=>({name:m.name.split(" /")[0].substring(0,8),coc:+m.cf.coc.toFixed(1),cap:+m.cf.capRate.toFixed(1)}))} margin={{left:-15,right:2}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="name" tick={{fill:"#6b7a94",fontSize:8}} angle={-40} textAnchor="end" height={50}/>
                <YAxis tick={{fill:"#6b7a94",fontSize:9}} tickFormatter={v=>`${v}%`} width={30}/>
                <Tooltip contentStyle={{background:"#1a2235",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:10}}/>
                <Legend wrapperStyle={{fontSize:9}}/>
                <Bar dataKey="coc" name="CoC%" fill={C.blue} radius={[3,3,0,0]} opacity={0.85}/>
                <Bar dataKey="cap" name="Cap%" fill={C.green} radius={[3,3,0,0]} opacity={0.85}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{display:"grid",gap:8}}>
            {filtered.map((m,i)=>(
              <div key={m.id} onClick={()=>{setSelId(m.id);setView("detail")}} style={{...crd,cursor:"pointer"}}>
                <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:6}}>
                  <Badge text={m.state} color={stClr(m.state)}/>
                  <span style={{fontSize:13,fontWeight:600}}>{m.name}</span>
                  <span style={{fontSize:9,color:"#556178",marginLeft:"auto"}}>#{i+1}</span>
                </div>
                <div className="gs">
                  {[["Price",fmtC(m.cf.pp),"#b0bdd0"],["ADR",`$${m.cf.adr}`,"#b0bdd0"],["Occ",`${Math.round(m.cf.occ*100)}%`,"#b0bdd0"],["Yield",`${m.cf.grossYield.toFixed(1)}%`,"#b0bdd0"],["Cap",`${m.cf.capRate.toFixed(1)}%`,m.cf.capRate>5?C.green:C.yellow],["CoC",`${m.cf.coc>=0?"+":""}${m.cf.coc.toFixed(1)}%`,m.cf.coc>0?C.green:C.red],["CF/mo",fmtCF(m.cf.monthlyCF),m.cf.monthlyCF>=0?C.green:C.red]].map(([l,v,c],j)=>(
                    <div key={j}>
                      <div style={{fontSize:8,color:"#556178",textTransform:"uppercase",marginBottom:1}}>{l}</div>
                      <div style={{fontSize:12,fontWeight:600,fontFamily:"'JetBrains Mono',monospace",color:c}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DETAIL */}
      {view==="detail"&&(
        <div style={{padding:"14px 12px"}}>
          <div className="sr" style={{marginBottom:14}}>
            {MARKETS.map(m=><Btn key={m.id} active={selId===m.id} onClick={()=>setSelId(m.id)} color={stClr(m.state)}>{m.name.split(" /")[0]}</Btn>)}
          </div>
          {sel?(<>
            <h2 style={{fontSize:18,fontWeight:700}}>{sel.name}</h2>
            <div style={{fontSize:11,color:"#556178",marginBottom:12}}>{PL[pt]} · {sel.notes}</div>
            <div className="gm" style={{marginBottom:14}}>
              <Metric label="Price" value={fmtC(sel.cf.pp)}/>
              <Metric label="Cash In" value={fmtC(sel.cf.cashIn)} sub={`${Math.round(ov.downPct*100)}% down`}/>
              <Metric label="Gross Rev" value={fmtC(sel.cf.gross)} sub="/yr"/>
              <Metric label="NOI" value={fmtC(sel.cf.noi)} sub={`${fmtC(sel.cf.noi/12)}/mo`}/>
              <Metric label="Debt Service" value={fmtC(sel.cf.mortgage)} sub={`${fmtC(sel.cf.mortgage/12)}/mo`} color={C.red}/>
              <Metric label="Annual CF" value={fmtCF(sel.cf.cf)} sub={`NOI ${fmtC(sel.cf.noi)} − Mtg ${fmtC(sel.cf.mortgage)}`} color={sel.cf.cf>=0?C.green:C.red}/>
              <Metric label="Monthly CF" value={fmtCF(sel.cf.monthlyCF)} sub={`${fmtC(sel.cf.noi/12)} NOI − ${fmtC(sel.cf.mortgage/12)} mtg`} color={sel.cf.monthlyCF>=0?C.green:C.red}/>
              <Metric label="CoC Return" value={`${sel.cf.coc.toFixed(1)}%`} sub={`Cap ${sel.cf.capRate.toFixed(1)}%`} color={sel.cf.coc>0?C.green:C.red}/>
            </div>
            <div className="g3" style={{marginBottom:14}}>
              <div style={crd}>
                <div style={{fontSize:12,fontWeight:600,marginBottom:8,color:C.green}}>Income</div>
                <KV label="Base ADR" value={`$${sel.cf.adr}`}/><KV label="Occupancy" value={`${Math.round(sel.cf.occ*100)}%`}/><KV label="Nights Booked" value={`${Math.round(sel.cf.nights)}`}/>
                <KV sep color="rgba(255,255,255,0.06)"/>
                <div style={{fontSize:10,color:"#7a8ba5",textTransform:"uppercase",letterSpacing:"0.04em",margin:"4px 0 2px"}}>Personal Use</div>
                <KV label={`🎿 Peak (Dec-Mar)`} value={`${sel.cf.peakPersonal}nt @ ~$${sel.cf.peakAdr}/nt`}/>
                <KV label={`☀️ Off-Peak (Apr-Nov)`} value={`${sel.cf.offPersonal}nt @ ~$${sel.cf.offAdr}/nt`}/>
                <KV label="Revenue Displaced" value={`-${fmtC(sel.cf.displaced)}`} color={C.yellow} bold/>
                {sel.cf.totalPersonal>14&&<div style={{fontSize:10,color:C.yellow,marginTop:4,lineHeight:1.4}}>⚠️ {sel.cf.totalPersonal} nights exceeds IRS 14-day safe harbor — may reclassify as personal residence</div>}
                <KV sep color="rgba(52,211,153,0.3)"/><KV label="Gross Revenue" value={fmtC(sel.cf.gross)} color={C.green} bold/>
                <KV label="− Total Expenses" value={`-${fmtC(sel.cf.expenses)}`} color={C.red} bold/>
                <KV label="= NOI" value={fmtC(sel.cf.noi)} color={sel.cf.noi>=0?C.green:C.red} bold/>
              </div>
              <div style={crd}>
                <div style={{fontSize:12,fontWeight:600,marginBottom:8,color:C.red}}>Expenses</div>
                <KV label={`Mgmt ${Math.round(ov.mgmt*100)}%`} value={fmtC(sel.cf.gross*ov.mgmt)}/><KV label="Tax" value={fmtC(sel.cf.pp*sel.propertyTaxRate)}/><KV label="Insurance" value={fmtC(sel.cf.pp*sel.insuranceRate)}/><KV label="HOA" value={fmtC(sel.hoaAvg*12)}/><KV label="Maint" value={fmtC(sel.cf.pp*0.01)}/><KV label="Other" value={fmtC(sel.cf.pp*0.01)}/>
                <KV sep color="rgba(248,113,113,0.3)"/><KV label="Total Expenses" value={fmtC(sel.cf.expenses)} color={C.red} bold/>
                <KV label="Per Month" value={fmtC(sel.cf.expenses/12)} color={C.red} bold/>
              </div>
              <div style={crd}>
                <div style={{fontSize:12,fontWeight:600,marginBottom:8,color:C.blue}}>Mortgage & Returns</div>
                <KV label="Down" value={fmtC(sel.cf.pp*ov.downPct)}/><KV label="Loan" value={fmtC(sel.cf.pp*(1-ov.downPct))}/><KV label="Mo Mortgage" value={fmtC(sel.cf.mortgage/12)}/><KV label="Yr Mortgage" value={fmtC(sel.cf.mortgage)}/>
                <KV sep color="rgba(99,179,237,0.3)"/>
                <KV label="Gross Yield" value={`${sel.cf.grossYield.toFixed(1)}%`} color={C.blue} bold/><KV label="Cap Rate" value={`${sel.cf.capRate.toFixed(1)}%`} color={C.blue} bold/><KV label="CoC Return" value={`${sel.cf.coc.toFixed(1)}%`} color={C.blue} bold/>
                <KV sep color={sel.cf.cf>=0?"rgba(52,211,153,0.3)":"rgba(248,113,113,0.3)"}/>
                <div style={{background:sel.cf.cf>=0?"rgba(52,211,153,0.06)":"rgba(248,113,113,0.06)",borderRadius:8,padding:"8px 10px",marginTop:4}}>
                  <div style={{fontSize:10,color:"#7a8ba5",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Monthly Cash Flow</div>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",fontFamily:"'JetBrains Mono',monospace"}}>
                    <span style={{fontSize:14,fontWeight:600,color:C.green}}>{fmtC(sel.cf.noi/12)}</span>
                    <span style={{fontSize:11,color:"#556178"}}>NOI</span>
                    <span style={{fontSize:14,color:"#556178"}}>−</span>
                    <span style={{fontSize:14,fontWeight:600,color:C.red}}>{fmtC(sel.cf.mortgage/12)}</span>
                    <span style={{fontSize:11,color:"#556178"}}>mtg</span>
                    <span style={{fontSize:14,color:"#556178"}}>=</span>
                    <span style={{fontSize:16,fontWeight:700,color:sel.cf.monthlyCF>=0?C.green:C.red}}>{fmtCF(sel.cf.monthlyCF)}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",fontFamily:"'JetBrains Mono',monospace",marginTop:6}}>
                    <span style={{fontSize:10,color:"#7a8ba5",textTransform:"uppercase",letterSpacing:"0.05em"}}>Annual:</span>
                    <span style={{fontSize:13,fontWeight:600,color:C.green}}>{fmtC(sel.cf.noi)}</span>
                    <span style={{fontSize:10,color:"#556178"}}>−</span>
                    <span style={{fontSize:13,fontWeight:600,color:C.red}}>{fmtC(sel.cf.mortgage)}</span>
                    <span style={{fontSize:10,color:"#556178"}}>=</span>
                    <span style={{fontSize:14,fontWeight:700,color:sel.cf.cf>=0?C.green:C.red}}>{fmtCF(sel.cf.cf)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={crd}>
              <div style={{fontSize:12,fontWeight:600,marginBottom:10,color:"#8a9bb5"}}>Monthly Revenue vs Costs</div>
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={sel.cf.monthly} margin={{left:-15,right:2}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                  <XAxis dataKey="month" tick={{fill:"#6b7a94",fontSize:9}}/>
                  <YAxis tick={{fill:"#6b7a94",fontSize:9}} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`} width={30}/>
                  <Tooltip contentStyle={{background:"#1a2235",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:10}} formatter={v=>[`$${fmt(v)}`,""]}/>
                  <Legend wrapperStyle={{fontSize:9}}/>
                  <Area type="monotone" dataKey="revenue" fill="rgba(52,211,153,0.12)" stroke={C.green} strokeWidth={2} name="Rev"/>
                  <Bar dataKey="expenses" fill="rgba(248,113,113,0.5)" radius={[2,2,0,0]} name="Exp"/>
                  <Line type="monotone" dataKey="mortgage" stroke={C.blue} strokeWidth={2} strokeDasharray="5 5" dot={false} name="Mtg"/>
                  <Line type="monotone" dataKey="cashFlow" stroke={C.yellow} strokeWidth={2} dot={{fill:C.yellow,r:2}} name="CF"/>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>):(<div style={{textAlign:"center",padding:40,color:"#556178"}}><div style={{fontSize:36,marginBottom:6}}>🏔️</div><div style={{fontSize:13}}>Select a market above</div></div>)}
        </div>
      )}

      {/* LIVE */}
      {view==="live"&&(
        <div style={{padding:"14px 12px"}}>
          <h2 style={{fontSize:16,fontWeight:700,marginBottom:10}}>🔴 Live Market Data</h2>

          {/* ── Controls: market picker + fetch button ── */}
          <div style={{...crd,marginBottom:12}}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:8}}>
              <select
                value={liveMarket}
                onChange={e=>setLiveMarket(e.target.value)}
                style={{flex:"1 1 200px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"8px 12px",color:"#e8edf5",fontSize:13,outline:"none"}}
              >
                {MARKETS.map(m=><option key={m.id} value={m.id} style={{background:"#0f1729"}}>{m.name} ({m.state})</option>)}
              </select>
              <button
                onClick={()=>fetchMkt(MARKETS.find(m=>m.id===liveMarket))}
                disabled={!apiKey||ld[liveMarket]}
                style={{padding:"8px 18px",borderRadius:8,border:"none",cursor:apiKey&&!ld[liveMarket]?"pointer":"not-allowed",fontSize:12,fontWeight:600,background:apiKey?C.blue:"rgba(255,255,255,0.08)",color:apiKey?"#0a0e1a":"#556178",flexShrink:0}}
              >{ld[liveMarket]?"Fetching…":"Fetch Live Data"}</button>
            </div>
            {/* Address / city search */}
            <div style={{display:"flex",gap:8}}>
              <input type="text" placeholder="Search any address or city (e.g. 'Breckenridge, CO')…" value={addr} onChange={e=>setAddr(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchAddr()}/>
              <button onClick={searchAddr} disabled={!apiKey||!addr||ld.a} style={{padding:"7px 14px",borderRadius:8,border:"none",cursor:apiKey&&addr?"pointer":"not-allowed",fontSize:11,fontWeight:600,background:apiKey&&addr?C.cyan:"rgba(255,255,255,0.08)",color:apiKey&&addr?"#0a0e1a":"#556178",flexShrink:0}}>{ld.a?"…":"Search"}</button>
            </div>
            {!apiKey&&<div style={{fontSize:11,color:C.yellow,marginTop:8}}>⚠ Enter your RapidAPI key in the header to enable live data fetching.</div>}
          </div>

          {/* ── API status pills + debug toggle ── */}
          {apiRes[liveMarket]&&(
            <div style={{marginBottom:10,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <Status results={apiRes[liveMarket]} loading={ld[liveMarket]}/>
              <button onClick={()=>setDebugMode(p=>!p)} style={{marginLeft:"auto",padding:"2px 8px",fontSize:9,borderRadius:4,border:"1px solid rgba(255,255,255,0.1)",background:debugMode?"rgba(251,191,36,0.12)":"transparent",color:debugMode?C.yellow:"#556178",cursor:"pointer",flexShrink:0}}>
                {debugMode?"▲ hide raw":"▼ raw JSON"}
              </button>
            </div>
          )}

          {/* ── Raw JSON debug panel ── */}
          {debugMode&&apiRes[liveMarket]&&(
            <div style={{...crd,borderColor:"rgba(251,191,36,0.2)",marginBottom:12,background:"rgba(0,0,0,0.3)"}}>
              <div style={{fontSize:11,fontWeight:600,color:C.yellow,marginBottom:8}}>🔬 Raw API Responses — use this to verify endpoint paths &amp; field names</div>
              {apiRes[liveMarket].map((r,i)=>(
                <div key={i} style={{marginBottom:10}}>
                  <div style={{fontSize:10,fontWeight:600,color:r.error?C.red:C.green,marginBottom:4}}>
                    {r.source} {r.endpoint?<span style={{color:"#556178",fontFamily:"'JetBrains Mono',monospace",fontWeight:400}}>→ {r.endpoint}</span>:null}
                    {r.error&&<span style={{color:C.red,fontWeight:400}}> — {r.error}</span>}
                  </div>
                  {!r.error&&(
                    <pre style={{fontSize:9,color:"#a8b4c8",background:"rgba(0,0,0,0.4)",padding:"8px 10px",borderRadius:6,overflowX:"auto",maxHeight:200,whiteSpace:"pre-wrap",wordBreak:"break-all"}}>
                      {JSON.stringify(r.data,null,2).slice(0,2000)}
                      {JSON.stringify(r.data,null,2).length>2000?"…(truncated)":""}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Zillow listings ── */}
          {(()=>{
            const zR=apiRes[liveMarket]?.find(r=>r.source==="zillow");
            if(!zR)return null;
            // Realtime Scraper returns props[] — field names: area (sqft), bedrooms, bathrooms, price, zestimate, rentZestimate
            const props=zR.data?.props||[];
            const total=zR.data?.totalResultCount||zR.data?.resultsCount||null;
            return(
              <div style={{...crd,marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:600,color:C.blue,marginBottom:8}}>
                  🏠 Zillow Realtime Listings — {MARKETS.find(m=>m.id===liveMarket)?.name}
                  {total?<span style={{fontSize:10,color:"#556178",marginLeft:8}}>{total} total found</span>:null}
                  {zR.endpoint&&<span style={{fontSize:9,color:"#3d4a5e",marginLeft:8,fontFamily:"'JetBrains Mono',monospace"}}>private-zillow{zR.endpoint}</span>}
                </div>
                {zR.error?<div style={{fontSize:11,color:C.red}}>⚠ {zR.error}</div>:(
                  props.length===0?<div style={{fontSize:11,color:"#556178"}}>No listings returned — check your Zillow Realtime Scraper subscription on RapidAPI.</div>:
                  <div style={{display:"grid",gap:6}}>
                    {props.slice(0,6).map((p,i)=>{
                      // Handle both old (livingArea) and new (area) field names
                      const sqft=p.livingArea||p.area||null;
                      return(
                        <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 10px",background:"rgba(255,255,255,0.03)",borderRadius:6,gap:8,flexWrap:"wrap"}}>
                          <div>
                            <div style={{fontSize:12,fontWeight:600,color:"#e8edf5"}}>{p.address||"—"}</div>
                            <div style={{fontSize:10,color:"#556178",marginTop:2}}>
                              {[(p.bedrooms||p.beds)&&`${p.bedrooms||p.beds}bd`,p.bathrooms&&`${p.bathrooms}ba`,sqft&&`${fmt(sqft)} sqft`,p.rentZestimate&&`RentZest $${fmt(p.rentZestimate)}/mo`].filter(Boolean).join(" · ")}
                            </div>
                          </div>
                          <div style={{textAlign:"right",flexShrink:0}}>
                            <div style={{fontSize:14,fontWeight:700,color:C.green,fontFamily:"'JetBrains Mono',monospace"}}>{p.price?fmtC(p.price):"—"}</div>
                            {p.zestimate?<div style={{fontSize:9,color:"#556178"}}>Zest {fmtC(p.zestimate)}</div>:null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Airbnb Market & Rental Intelligence — live listings ── */}
          {(()=>{
            const aR=apiRes[liveMarket]?.find(r=>r.source==="airbnb");
            if(!aR)return null;
            // Handle multiple response shapes from the Rental Intelligence API
            const list=(
              aR.data?.results?.searchResults||
              aR.data?.searchResults||
              aR.data?.listings||
              aR.data?.results||
              aR.data?.data||
              (Array.isArray(aR.data)?aR.data:[])
            );
            return(
              <div style={{...crd,marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:600,color:C.red,marginBottom:8}}>
                  🏠 Airbnb Active Listings
                  {aR.endpoint&&<span style={{fontSize:9,color:"#3d4a5e",marginLeft:8,fontFamily:"'JetBrains Mono',monospace"}}>airbnb-market-rental-intelligence-api{aR.endpoint}</span>}
                </div>
                {aR.error?<div style={{fontSize:11,color:C.red}}>⚠ {aR.error}</div>:(
                  list.length===0?<div style={{fontSize:11,color:"#556178"}}>No listings returned.</div>:
                  <div style={{display:"grid",gap:6}}>
                    {list.slice(0,6).map((r,i)=>{
                      const listing=r.listing||r;
                      // price.rate is the standard field per API docs; fall back to older shapes
                      const nightlyAmt=r.price?.rate||r.pricingQuote?.rate?.amount||r.price?.amount||listing.price?.rate||listing.price?.amount||listing.nightly_price||null;
                      const rating=r.rating||listing.rating||listing.avgRating||listing.avg_rating||listing.star_rating||null;
                      const reviews=r.reviewsCount||listing.reviewsCount||listing.reviews_count||listing.reviews||0;
                      const name=r.name||listing.name||`Listing ${i+1}`;
                      const roomType=r.roomType||listing.roomType||r.room_type||listing.room_type||null;
                      return(
                        <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 10px",background:"rgba(255,255,255,0.03)",borderRadius:6,gap:8,flexWrap:"wrap"}}>
                          <div>
                            <div style={{fontSize:12,fontWeight:600,color:"#e8edf5"}}>{name}</div>
                            <div style={{fontSize:10,color:"#556178",marginTop:2}}>
                              {[rating&&`★ ${Number(rating).toFixed(2)}`,reviews>0&&`(${reviews} reviews)`,roomType].filter(Boolean).join(" · ")}
                            </div>
                          </div>
                          <div style={{textAlign:"right",flexShrink:0}}>
                            {nightlyAmt?<div style={{fontSize:14,fontWeight:700,color:C.yellow,fontFamily:"'JetBrains Mono',monospace"}}>${fmt(nightlyAmt)}/nt</div>:<div style={{fontSize:11,color:"#556178"}}>—</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── AirDNA STR Market Analytics ── */}
          {(()=>{
            const adR=apiRes[liveMarket]?.find(r=>r.source==="airdna");
            if(!adR)return null;

            // Parse stats — two possible shapes:
            // A) mode="rentalizer": data.property_stats.{occupancy,adr,revenue}.ltm
            // B) mode="market":     data.{occupancy,adr,revenue}[last entry].{occupancy_rate,adr,revenue}
            let occ=null,adr=null,rev=null,active=null,revpar=null;
            if(adR.data){
              if(adR.mode==="rentalizer"||adR.data?.property_stats){
                const ps=adR.data?.property_stats||adR.data;
                occ=ps?.occupancy?.ltm||ps?.occupancy_rate||null;
                adr=ps?.adr?.ltm||ps?.average_daily_rate||null;
                rev=ps?.revenue?.ltm||ps?.annual_revenue||null;
                revpar=null;
              } else {
                // Market mode — take most recent month from each array
                const occArr=adR.data?.occupancy?.data||adR.data?.occupancy||[];
                const adrArr=adR.data?.adr?.data||adR.data?.adr||[];
                const revArr=adR.data?.revenue?.data||adR.data?.revenue||[];
                const last=a=>(Array.isArray(a)?a[a.length-1]:a)||{};
                occ=last(occArr).occupancy_rate||null;
                adr=last(adrArr).adr||null;
                rev=last(revArr).revenue||null;
                revpar=last(revArr).revpar||null;
                // Active listings from occupancy entry
                active=last(occArr).active_listings||null;
              }
            }
            const stats=[[`Occupancy`,occ!=null?`${Math.round(Number(occ)*(Number(occ)<2?100:1))}%`:null],[`Avg Daily Rate`,adr?fmtC(adr):null],[`Revenue/yr`,rev?fmtC(rev):null],[`Active Listings`,active?fmt(active):null],[`RevPAR`,revpar?fmtC(revpar):null]].filter(([,v])=>v);
            return(
              <div style={{...crd,marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:600,color:C.orange,marginBottom:8}}>
                  📊 AirDNA STR Market Analytics
                  {adR.endpoint&&<span style={{fontSize:9,color:"#3d4a5e",marginLeft:8,fontFamily:"'JetBrains Mono',monospace"}}>airdna1 {adR.endpoint}</span>}
                  {adR.mode&&<span style={{fontSize:9,color:"#4a5568",marginLeft:6}}>({adR.mode})</span>}
                </div>
                {adR.error
                  ?<div style={{fontSize:11,color:C.red}}>⚠ {adR.error}</div>
                  :stats.length>0
                    ?<div className="gm">{stats.map(([l,v],i)=><Metric key={i} label={l} value={v} color={C.orange}/>)}</div>
                    :<div style={{fontSize:11,color:"#556178",padding:"4px 0"}}>No STR stats in response — click "▼ raw JSON" to inspect. Raw: <code style={{fontSize:9,color:"#3d4a5e"}}>{JSON.stringify(adR.data).slice(0,150)}</code></div>
                }
              </div>
            );
          })()}

          {/* ── Address search results ── */}
          {apiRes.a&&(
            <div style={{...crd,marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:600,color:C.cyan,marginBottom:8}}>🔍 Address Search Results</div>
              <Status results={apiRes.a} loading={ld.a}/>
              {apiRes.a.map((r,ri)=>{
                const props2=r.data?.props||r.data?.results||r.data?.data?.home_search?.results||[];
                return r.error?(
                  <div key={ri} style={{fontSize:11,color:C.red,marginTop:6}}>⚠ {r.source}: {r.error}</div>
                ):(
                  <div key={ri} style={{marginTop:8,display:"grid",gap:6}}>
                    {props2.slice(0,4).map((p,i)=>{
                      const price2=p.price||p.list_price||null;
                      const addr3=p.address||(p.location?.address?.line)||"—";
                      return(
                        <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 10px",background:"rgba(255,255,255,0.03)",borderRadius:6,gap:8}}>
                          <div>
                            <div style={{fontSize:12,fontWeight:600,color:"#e8edf5"}}>{addr3}</div>
                            <div style={{fontSize:10,color:"#556178"}}>{[p.bedrooms&&`${p.bedrooms}bd`,p.bathrooms&&`${p.bathrooms}ba`,(p.livingArea||p.area)&&`${fmt(p.livingArea||p.area)} sqft`].filter(Boolean).join(" · ")}</div>
                          </div>
                          <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:C.cyan,fontSize:13,flexShrink:0}}>{price2?fmtC(price2):"—"}</div>
                        </div>
                      );
                    })}
                    {props2.length===0&&<div style={{fontSize:11,color:"#556178"}}>{r.source}: no results.</div>}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── API Setup Guide ── */}
          <div style={{...crd,borderColor:"rgba(251,191,36,0.15)",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:600,color:C.yellow,marginBottom:10}}>🔑 RapidAPI Setup — Subscribe to each API (one key unlocks all)</div>
            <div className="g2">
              {[
                {n:"Private Zillow",h:"private-zillow.p.rapidapi.com",d:"Live for-sale listings, Zestimate, RentZestimate — high-reliability Zillow data",c:C.blue,ok:true},
                {n:"Airbnb Intelligence",h:"airbnb-market-rental-intelligence-api.p.rapidapi.com",d:"Airbnb market & rental intelligence — occupancy, ADR, revenue by market",c:C.red,ok:true},
                {n:"AirDNA",h:"airdna1.p.rapidapi.com",d:"Gold-standard STR analytics — active listings, RevPAR, market scoring",c:C.green,ok:true},
              ].map((a,i)=>(
                <div key={i} style={{padding:"8px 10px",background:"rgba(255,255,255,0.02)",borderRadius:6,border:`1px solid ${a.c}22`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:2,gap:4}}>
                    <span style={{fontSize:12,fontWeight:600,color:a.c}}>{a.n}</span>
                    <span style={{fontSize:9,color:a.ok?C.green:C.yellow,flexShrink:0}}>{a.ok?"✓ Active":"⚠ May need paid plan"}</span>
                  </div>
                  <div style={{fontSize:10,color:"#7a8ba5",marginBottom:4}}>{a.d}</div>
                  <div style={{fontSize:9,fontFamily:"'JetBrains Mono',monospace",color:"#3d4a5e"}}>{a.h}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Deploy / CORS note ── */}
          <div style={{...crd,borderColor:"rgba(99,179,237,0.12)"}}>
            <div style={{fontSize:12,fontWeight:600,color:C.blue,marginBottom:6}}>💡 CORS / Deployment Note</div>
            <div style={{fontSize:11,color:"#556178",lineHeight:1.6}}>
              RapidAPI supports browser requests from deployed domains. If you see CORS errors, run locally (<code style={{background:"rgba(255,255,255,0.06)",padding:"1px 5px",borderRadius:3,fontFamily:"'JetBrains Mono',monospace"}}>npm run dev</code>) or deploy free in ~30 sec:
            </div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#e8edf5",background:"rgba(0,0,0,0.3)",padding:"8px 10px",borderRadius:6,marginTop:8,wordBreak:"break-all"}}>
              npm i -g vercel &amp;&amp; vercel --yes
            </div>
          </div>
        </div>
      )}

      {/* SEASONALITY */}
      {view==="seasonal"&&(
        <div style={{padding:"14px 12px"}}>
          <h2 style={{fontSize:16,fontWeight:700,marginBottom:3}}>Occupancy Seasonality</h2>
          <p style={{fontSize:11,color:"#556178",marginBottom:12}}>{PL[pt]} · Monthly occupancy + revenue</p>
          <div style={{display:"grid",gap:12,marginBottom:14}}>
            {[["CO","Colorado"],["VT","Vermont"],["WY","Wyoming"],["ID","Idaho"]].filter(([st])=>analysis.some(m=>m.state===st)).map(([st,label])=>(
              <div key={st} style={crd}>
                <div style={{fontSize:12,fontWeight:600,marginBottom:8,color:stClr(st)}}>{label}</div>
                <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
                  <table style={{minWidth:480,width:"100%",borderCollapse:"collapse",fontSize:9}}>
                    <thead><tr>
                      <th style={{textAlign:"left",padding:"3px 4px",color:"#556178",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>Market</th>
                      {MONTHS.map(m=><th key={m} style={{padding:"3px 2px",color:"#556178",borderBottom:"1px solid rgba(255,255,255,0.08)",textAlign:"center"}}>{m}</th>)}
                      <th style={{padding:"3px 2px",color:"#8a9bb5",borderBottom:"1px solid rgba(255,255,255,0.08)",textAlign:"center",fontWeight:700}}>Avg</th>
                    </tr></thead>
                    <tbody>{analysis.filter(m=>m.state===st).map(m=>(
                      <tr key={m.id}>
                        <td style={{padding:"2px 4px",fontWeight:500,whiteSpace:"nowrap",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>{m.name.split(" /")[0]}</td>
                        {m.seasonality.map((v,i)=>(<td key={i} style={{padding:"2px",textAlign:"center",borderBottom:"1px solid rgba(255,255,255,0.03)",background:`${stClr(st)}${Math.round((v/0.85)*0.2*255).toString(16).padStart(2,"0")}`,color:v>0.6?"#e8edf5":"#8a9bb5",fontFamily:"'JetBrains Mono',monospace",fontSize:8}}>{Math.round(v*100)}%</td>))}
                        <td style={{padding:"2px",textAlign:"center",borderBottom:"1px solid rgba(255,255,255,0.03)",fontWeight:700,fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#e8edf5"}}>{Math.round(m.seasonality.reduce((a,b)=>a+b,0)/12*100)}%</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
          <div style={crd}>
            <div style={{fontSize:12,fontWeight:600,marginBottom:10,color:"#8a9bb5"}}>Monthly Revenue — {PL[pt]}</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={MONTHS.map((month,i)=>{const o={month};const isPk=PEAK_IDX.has(i);filtered.forEach(m=>{const bd=DAYS[i],ps=isPk?(ov.peakPersonal*bd/PEAK_DAYS):(ov.offPersonal*bd/OFF_DAYS),av=Math.max(0,bd-ps),n=av*m.seasonality[i]*0.95,avgS=m.seasonality.reduce((a,b)=>a+b,0)/12;o[m.name.split(" /")[0].substring(0,7)]=Math.round(n*m.adr[pt]*(m.seasonality[i]/avgS))});return o})} margin={{left:-15,right:2}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="month" tick={{fill:"#6b7a94",fontSize:9}}/>
                <YAxis tick={{fill:"#6b7a94",fontSize:9}} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`} width={30}/>
                <Tooltip contentStyle={{background:"#1a2235",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,fontSize:9}} formatter={v=>[`$${fmt(v)}`,""]}/>
                <Legend wrapperStyle={{fontSize:8}}/>
                {filtered.map((m,i)=>{const colors=[C.blue,C.green,C.yellow,C.purple,C.red,"#fb923c","#2dd4bf","#e879f9","#38bdf8","#4ade80","#fbbf24","#c084fc","#fb7185"];return <Bar key={m.id} dataKey={m.name.split(" /")[0].substring(0,7)} fill={colors[i%colors.length]} radius={[2,2,0,0]} opacity={0.8}/>})}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="g3" style={{marginTop:12}}>
            {[{i:"🎿",t:"Peak (Dec-Mar)",c:C.blue,d:"65-85% occ. ADR 30-50% above avg. Jackson 86% Feb."},{i:"🍂",t:"Shoulder",c:C.yellow,d:"VT foliage Sep-Oct adds 10-15pts vs CO. Jackson strong fall."},{i:"☀️",t:"Summer (Jun-Sep)",c:C.green,d:"CO/WY win — Grand Teton NP drives Jackson to 72%."}].map((x,i)=>(
              <div key={i} style={{...crd,borderColor:`${x.c}22`}}><div style={{fontSize:12,fontWeight:600,color:x.c,marginBottom:3}}>{x.i} {x.t}</div><div style={{fontSize:11,color:"#7a8ba5",lineHeight:1.4}}>{x.d}</div></div>
            ))}
          </div>
        </div>
      )}

      <div style={{padding:"12px",borderTop:"1px solid rgba(255,255,255,0.04)",fontSize:9,color:"#2d3a4e",textAlign:"center",marginTop:10}}>
        AirDNA + Zillow · Q4 2024/Q1 2025 · Live via RapidAPI · Tenth Mountain
      </div>
    </div>
  );
}
