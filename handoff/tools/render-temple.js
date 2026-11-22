const fs=require('fs'),vm=require('vm'),path=require('path');
const {png,scale}=require('./harness.js');
function script(name){const s=fs.readFileSync(path.join(__dirname,'..','reference',name+'.html'),'utf8');return /<script>([\s\S]*)<\/script>/.exec(s)[1]}
fs.mkdirSync(path.join(__dirname,'out'),{recursive:true});
const OUT=(f)=>path.join(__dirname,'out',f);
const el=()=>({addEventListener(){},getBoundingClientRect(){return {left:0,width:100}},value:35,textContent:''});
const cvEl=Object.assign(el(),{getContext(){return {createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){}}}});
const sb={document:{getElementById:(id)=>id==='sc'?cvEl:el()},matchMedia:()=>({matches:false}),IntersectionObserver:class{observe(){}},requestAnimationFrame(){return 0},performance,Math,console};
sb.window=sb;vm.createContext(sb);vm.runInContext(script('temple-scene-demo'),sb);
const T=sb.__temple;
for(const [name,v] of [['t0',0],['t1',1]]){T.set(v);const [w,h,o]=scale(T.D,T.W,T.H,6,[13,12,10]);fs.writeFileSync(OUT(`temple_${name}.png`),png(w,h,o))}
console.log('temple frames written');
