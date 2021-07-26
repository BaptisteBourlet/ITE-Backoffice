const object = {
   FRDesc: 'french',
   FRCat: 'french catalog',
   RUDesc: 'russian',
   DEDesc: 'german',
   ENDesc: 'english',
   ESDesc: 'spanish',
}

const allParams = []
  


for (const [key, value] of Object.entries(object)) {
   let language = key.charAt(0) + key.charAt(1);
   if (language === 'FR') {
      allParams.FR[key] = value;
   }
}

console.log(allParams)

