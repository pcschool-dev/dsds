// อัดวิดีโอ fbgate.mp4 ใหม่: npm i puppeteer-core (นอก OneDrive) ; node cap.js -> frames/ ; ffmpeg -framerate 30 -i frames/f%04d.png -c:v libx264 -pix_fmt yuv420p -crf 26 -an ../fbgate.mp4
const puppeteer=require('puppeteer-core');const fs=require('fs');const path=require('path');
(async()=>{
 const shots=process.argv.slice(2).map(Number);
 const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new'});
 const p=await b.newPage();await p.setViewport({width:540,height:1170,deviceScaleFactor:1});
 await p.goto('file://'+path.join(__dirname,'clip.html'),{waitUntil:'networkidle0'});await p.evaluate(()=>document.fonts.ready);
 const dur=await p.evaluate(()=>window.DUR);
 const out=path.join(__dirname,'frames');fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out);
 const ts=shots.length?shots:Array.from({length:Math.round(dur*30)},(_,i)=>i/30);
 for(let i=0;i<ts.length;i++){await p.evaluate(t=>window.seek(t),ts[i]);await p.screenshot({path:path.join(out,(shots.length?'s':'f')+String(i).padStart(4,'0')+'.png')});}
 await b.close();
})();
