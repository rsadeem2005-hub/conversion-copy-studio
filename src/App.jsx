import {useMemo,useState} from "react";

const SAMPLE="We are a leading provider of innovative solutions. Our amazing software is the best way to manage your team's projects and it is very easy to use!!! Contact us today to learn more about what we offer.";
const WEAK=["very","really","just","amazing","innovative","solution","solutions","leading","best","cutting-edge","world-class","unique","synergy","revolutionary","state-of-the-art","seamless","robust"];
const CTA=/\b(get|start|try|join|book|buy|shop|download|subscribe|claim|reserve|order|sign up|call|request|see|save|grab|begin|compare|choose|build|learn)\b/i;

const syl=w=>{
 w=w.toLowerCase().replace(/[^a-z]/g,"");
 if(!w)return 0;
 if(w.length<=3)return 1;
 w=w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/,"").replace(/^y/,"");
 const m=w.match(/[aeiouy]{1,2}/g);
 return Math.max(1,m?m.length:1)
};

function analyze(t){
 const words=t.trim().match(/[\w'’-]+/g)||[],
       sents=t.split(/[.!?]+(?:\s|$)/).filter(s=>s.trim()),
       n=words.length,
       sc=Math.max(1,sents.length);

 const avg=n/sc,
       sy=words.reduce((a,w)=>a+syl(w),0),
       ease=n?206.835-1.015*avg-84.6*(sy/n):0;

 const lw=words.map(w=>w.toLowerCase()),
       cnt=l=>lw.filter(w=>l.includes(w)).length,
       you=cnt(["you","your","you're","yours"]),
       we=cnt(["we","our","us","i","my","we're"]),
       weak=[...new Set(lw.filter(w=>WEAK.includes(w)))],
       nums=(t.match(/\d[\d,.%]*/g)||[]).length,
       ex=(t.match(/!/g)||[]).length;

 return{
  n,
  avg,
  ease:Math.max(0,Math.min(100,ease)),
  you,
  we,
  weak,
  nums,
  ex,
  cta:CTA.test(t),
  sc
 };
}

const easeLabel=e=>
 e>=70?"Easy to read":
 e>=50?"Fairly easy":
 e>=30?"Hard going":
 "Very hard";

function Checker(){

 const [t,setT]=useState("");
 const a=useMemo(()=>analyze(t),[t]);

 const checks=a.n?[
  [
   a.ease>=60,
   "Reading ease",
   "Score "+Math.round(a.ease)+" ("+easeLabel(a.ease)+"). Aim for 60 or higher by using shorter words."
  ],
  [
   a.avg<=20,
   "Sentence length",
   "Average "+a.avg.toFixed(0)+" words. Aim for 20 or fewer; split long sentences."
  ],
  [
   a.you>=a.we,
   "Focus on the reader",
   "You "+a.you+" vs we/our "+a.we+". Lead with what the reader gets, not what you are."
  ],
  [
   a.nums>0,
   "Something specific",
   "Add a number, time frame or detail so the claim feels real."
  ],
  [
   a.cta,
   "Clear call to action",
   "Tell the reader exactly what to do next, using a verb like Get, Start or Book."
  ],
  [
   !a.weak.length,
   "Plain, believable words",
   a.weak.length
    ?"Replace or prove: "+a.weak.join(", ")+"."
    :"No vague buzzwords found."
  ],
  [
   a.ex<=1,
   "Calm punctuation",
   a.ex>1
    ?a.ex+" exclamation marks. One at most."
    :"Good."
  ]
 ]:[];

 const pass=checks.filter(c=>c[0]).length;

 const hl=t.split(/(\s+)/).map((w,i)=>
  WEAK.includes(
   w.toLowerCase().replace(/[^a-z-]/g,"")
  )
   ?<mark key={i}>{w}</mark>
   :w
 );

 return <div className="grid2">

  <section className="card">

   <div className="top">
    <h2>Paste your copy</h2>

    <button
     className="link"
     onClick={()=>setT(SAMPLE)}
    >
     Try a practice sample
    </button>
   </div>

   <textarea
    rows="9"
    value={t}
    onChange={e=>setT(e.target.value)}
    placeholder="Paste a headline, email, ad or landing page section"
    aria-label="Your copy"
   />

   {a.n>0&&
    <p
     className="hl"
     aria-label="Copy with vague words highlighted"
    >
     {hl}
    </p>
   }

   <p className="small">
    {a.n} words · {a.sc} {a.sc===1?"sentence":"sentences"}.
    Highlighted words are vague or hard to prove.
   </p>

  </section>

  <section className="card">

   <div className="top">
    <h2>Edit notes</h2>

    {a.n>0&&
     <b className="big">
      {pass}/{checks.length}
     </b>
    }
   </div>

   {a.n?
    <ul className="checks">

     {checks.map(([ok,h,d])=>
      <li
       key={h}
       className={ok?"y":"n"}
      >
       <span aria-hidden="true">
        {ok?"✓":"!"}
       </span>

       <div>
        <strong>{h}</strong>
        <small>{d}</small>
       </div>
      </li>
     )}

    </ul>
    :
    <p className="empty">
     Paste some copy to get edit notes. Nothing is sent anywhere;
     the check runs in your browser.
    </p>
   }

  </section>

 </div>;
}

function Headlines(){

 const [f,setF]=useState({
  product:"",
  audience:"",
  benefit:"",
  pain:""
 });

 const set=(k,v)=>setF({...f,[k]:v});

 const {
  product:p,
  audience:a,
  benefit:b,
  pain:n
 }=f;

 const cap=s=>
  s.charAt(0).toUpperCase()+s.slice(1);

 const list=
  b&&n&&a&&p
   ?[
    `${cap(b)} without ${n}`,
    `How ${a} can ${b}`,
    `Stop ${n}. Start ${b}.`,
    `5 simple ways ${a} can ${b}`,
    `The ${p} that helps ${a} ${b}`,
    `Finally, ${b} that doesn't mean ${n}`,
    `Tired of ${n}? Try ${p}`,
    `${cap(a)}: ${b} starts here`
   ]
   :[];

 const [m,setM]=useState("");

 const copy=async s=>{
  try{
   await navigator.clipboard.writeText(s);
   setM("Copied")
  }catch{
   setM("Copy failed")
  }

  setTimeout(()=>setM(""),1500)
 };

 const fld=(k,l,ph)=>
  <label className="fld">
   {l}
   <input
    value={f[k]}
    placeholder={ph}
    onChange={e=>set(k,e.target.value)}
   />
  </label>;

 return <div className="grid2">

  <section className="card">

   <h2>Tell me about the offer</h2>

   {fld(
    "product",
    "Product or service",
    "e.g. meal-prep service"
   )}

   {fld(
    "audience",
    "Who is it for?",
    "e.g. busy parents"
   )}

   {fld(
    "benefit",
    "Main benefit (a verb phrase)",
    "e.g. eat well on weeknights"
   )}

   {fld(
    "pain",
    "Problem to remove",
    "e.g. cooking after work"
   )}

   <p className="small">
    Write the benefit as a phrase that follows "can",
    such as "save two hours a week".
   </p>

  </section>

  <section className="card">

   <div className="top">
    <h2>Headline ideas</h2>
    <span className="msg" role="status">{m}</span>
   </div>

   {list.length?
    <ul className="hd">

     {list.map(h=>
      <li key={h}>

       <span>{h}</span>

       <button
        className="link"
        onClick={()=>copy(h)}
       >
        Copy
       </button>

      </li>
     )}

    </ul>
    :
    <p className="empty">
     Fill in all four fields to see eight headline formulas.
     Read each one aloud and edit it until it sounds like a person.
    </p>
   }

  </section>

 </div>;
}

const STUDIES=[
 {
  tag:"Email subject line",
  brand:"Fictional meal-kit brand",
  before:"Our Newsletter: Spring Update #14",
  after:"3 dinners, 20 minutes each: this week's menu",
  why:[
   "Replaces a label with a clear promise.",
   "Adds specifics: a number and a time.",
   "Tells the reader what is inside before they open."
  ]
 },
 {
  tag:"Landing page hero",
  brand:"Fictional invoicing app",
  before:"The all-in-one platform for modern business solutions",
  after:"Send an invoice in 30 seconds. Get paid sooner.",
  why:[
   "Swaps vague words for one concrete action.",
   "Names the outcome the reader wants.",
   "Shorter, so it is read in one glance."
  ]
 },
 {
  tag:"Button text",
  brand:"Fictional language-learning app",
  before:"Submit",
  after:"Start my free 7-day trial",
  why:[
   "A button should say what happens next.",
   "Uses first person, which feels like the reader's choice.",
   "Removes doubt by mentioning the trial."
  ]
 }
];

function Rewrites(){

 return <div className="studies">

  {STUDIES.map(s=>
   <article
    className="card"
    key={s.tag}
   >

    <div className="top">
     <h2>{s.tag}</h2>

     <span className="small">
      {s.brand}, practice example
     </span>
    </div>

    <div className="ba">

     <div className="bef">
      <small>Before</small>
      <p>{s.before}</p>
     </div>

     <div className="aft">
      <small>After</small>
      <p>{s.after}</p>
     </div>

    </div>

    <ul className="why">
     {s.why.map(w=>
      <li key={w}>{w}</li>
     )}
    </ul>

   </article>
  )}

 </div>
}

export default function App(){

 const tabs=[
  ["check","Copy checker"],
  ["head","Headline ideas"],
  ["study","Rewrite studies"]
 ];

 const [tab,setTab]=useState("check");

 return <div className="app">

  <header>
   <h1>Conversion Copy Studio</h1>
   <p>
    Make copy clearer, more specific and easier to act on.
   </p>
  </header>

  <div
   className="tabs"
   role="tablist"
  >

   {tabs.map(([k,l])=>
    <button
     key={k}
     role="tab"
     aria-selected={tab===k}
     className={tab===k?"on":""}
     onClick={()=>setTab(k)}
    >
     {l}
    </button>
   )}

  </div>

  <main>
   {tab==="check"
    ?<Checker/>
    :tab==="head"
    ?<Headlines/>
    :<Rewrites/>
   }
  </main>

  <footer>
   The checker gives editing guidelines, not a prediction of results.
   Brands in the studies are fictional.
  </footer>

 </div>;
}
