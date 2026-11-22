const fs=require('fs'),vm=require('vm'),zlib=require('zlib');
function crc(buf){let c,t=[];for(let n=0;n<256;n++){c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0}let r=0xffffffff;for(const b of buf)r=t[(r^b)&255]^(r>>>8);return (r^0xffffffff)>>>0}
function chunk(type,data){const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const td=Buffer.concat([Buffer.from(type),data]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([len,td,c])}
function png(w,h,rgba){const raw=Buffer.alloc((w*4+1)*h);for(let y=0;y<h;y++){raw[y*(w*4+1)]=0;Buffer.from(rgba.buffer,rgba.byteOffset+y*w*4,w*4).copy(raw,y*(w*4+1)+1)}
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);ihdr[8]=8;ihdr[9]=6;
return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))])}
function scale(src,w,h,k,bg){const W=w*k,H=h*k,o=new Uint8ClampedArray(W*H*4);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const s=((y/k|0)*w+(x/k|0))*4,d=(y*W+x)*4;const a=src[s+3]/255;o[d]=src[s]*a+bg[0]*(1-a);o[d+1]=src[s+1]*a+bg[1]*(1-a);o[d+2]=src[s+2]*a+bg[2]*(1-a);o[d+3]=255}return [W,H,o]}
module.exports={png,scale};
