const fs=require('fs'),vm=require('vm'),path=require('path');
const {png,scale}=require('./harness.js');
function script(name){const s=fs.readFileSync(path.join(__dirname,'..','reference',name+'.html'),'utf8');return /<script>([\s\S]*)<\/script>/.exec(s)[1]}
fs.mkdirSync(path.join(__dirname,'out'),{recursive:true});
const OUT=(f)=>path.join(__dirname,'out',f);
const mkEl=()=>({style:{},setAttribute(){},appendChild(){},addEventListener(){},classList:{toggle(){}},firstChild:null,textContent:''});
let ctxs=[];
const cards=[0,1,2].map(o=>{
  const ctx={createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4),w,h}),putImageData(img){this.last=img}};ctxs.push(ctx);
  const cv=Object.assign(mkEl(),{getContext:()=>ctx});
  const svg=mkEl();const plate={clientWidth:200};
  return Object.assign(mkEl(),{getAttribute:()=>String(o),querySelector:(s)=>s==='.plate'?plate:s==='canvas'?cv:s==='svg'?svg:mkEl()});
});
const sb={document:{querySelectorAll:()=>cards,createElementNS:()=>mkEl()},matchMedia:()=>({matches:false}),ResizeObserver:class{constructor(cb){this.cb=cb}observe(){this.cb()}},requestAnimationFrame(){return 1},performance,Math,console,Int8Array,Uint8Array,Uint8ClampedArray};
sb.window=sb;vm.createContext(sb);vm.runInContext(script('pillars-plates-demo'),sb);
const cs=sb.__pillars,R=sb.__pillarsRender;
const states=[0,0.5,1];const K=4,pad=8;
const tiles=[];
for(let o=0;o<3;o++){for(const P of states){const c=cs[o];c.P=P;c.lx=-.45;R(c);tiles.push({img:{data:new Uint8ClampedArray(c.ctx.last.data)},w:c.Wc,h:c.Hc})}}
const w=tiles[0].w,h=tiles[0].h,TW=(w*K+pad),TH=(h*K+pad);
const outW=TW*3,outH=TH*3,out=new Uint8ClampedArray(outW*outH*4);
for(let i=0;i<outW*outH;i++){out[i*4]=20;out[i*4+1]=18;out[i*4+2]=16;out[i*4+3]=255}
tiles.forEach((t,idx)=>{const col=idx%3,row=Math.floor(idx/3);const [sw,sh,so]=scale(t.img.data,t.w,t.h,K,[20,18,16]);
 for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){const d=((row*TH+y)*outW+(col*TW+x))*4,s=(y*sw+x)*4;out[d]=so[s];out[d+1]=so[s+1];out[d+2]=so[s+2]}});
fs.writeFileSync(OUT('pillars.png'),png(outW,outH,out));console.log('pillars montage',outW,outH);
