const object = {
   FRDesc: 'french',
   RUDesc: 'russian',
   DEDesc: 'german',
   ENDesc: 'english',
   ESDesc: 'spanish',
}


for (const [key, value] of Object.entries(object)) {
   if (key.charAt(0) + key.charAt(1) === 'ES') {
      console.log(value);
   } 

}