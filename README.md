<div dir="rtl">

# הורדת קבצים מ- JewishMusic.FM
  1. הוסיפו סימנייה חדשה בדפדפן.
  2. העתיקו לתוך הכתובת את הקוד הבא:
  
<div dir="ltr">
  
  ```js
javascript: (async()=>{const t="MusiCode1/jewish-music.fm";!async function(t){const e=document.createElement("script");e.type="text/javascript",e.src=t,document.head.appendChild(e),await new Promise((t=>e.onload=t))}(`https://cdn.jsdelivr.net/gh/${t}@${await async function(t){const e=await fetch(`https://api.github.com/repos/${t}/releases`),n=await e.json();return console.log(n[0].tag_name),n[0].tag_name}(t)}/build/bundle.js`)})();
  ```
 </div> 
  
  3. פתחו את אתר jewishMusic.FM.
  4. עברו לאלבום כלשהו.
  5. לחצו על הסימנייה והמתינו.

  נכתב עבור דיירי דירת 'ניצנים', אשדוד.

  יומן שינויים:
  0.0.7
  - עברתי מ- Js ל- Ts.
  - שם השיר הוא כעת בעברית, ולא כפי שהיה מקודם באנגלית.
</div>
