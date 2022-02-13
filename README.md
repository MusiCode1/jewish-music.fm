<div dir="rtl">

# הורדת קבצים מ- JewishMusic.FM
פרוייקט זה מאפשר להוריד אלבומים שלמים, מאתר JewishMusic.FM.

הפרוייקט משתמש ב- Svelte עבור קוד HTML, וב- TS עבור הלוגיקה.

## שימוש
  1. הוסיפו סימנייה חדשה בדפדפן.
  2. העתיקו לתוך הכתובת את הקוד הבא:
  
<div dir="ltr">
  
  ```js
javascript: !function(){"use strict";(async()=>{!async function(e){const t=document.createElement("script");t.type="text/javascript",t.src=e,document.head.appendChild(t),await new Promise((e=>t.onload=e))}("https://cdn.jsdelivr.net/gh/MusiCode1/jewish-music.fm@0.0.7/public/build/bundle.js")})()}();
  ```
 </div> 
  
  3. פתחו את אתר jewishMusic.FM.
  4. עברו לאלבום כלשהו.
  5. לחצו על הסימנייה והמתינו.

נכתב עבור דיירי דירת 'ניצנים', אשדוד.

## יומן שינויים:
### 0.0.7
  - עברתי מ- `JavaScript` ל- `TypeScript`.
  - שם השיר הוא כעת בעברית, ולא כפי שהיה מקודם באנגלית.
</div>
