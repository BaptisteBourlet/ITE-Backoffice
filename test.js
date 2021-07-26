const object = {
   FRDesc: 'french',
   FRCat: 'french catalog',
   RUDesc: 'russian',
   DEDesc: 'german',
   ENDesc: 'english',
   ESDesc: 'spanish',
}

const allParams = {
   FR: {}
}


for (const [key, value] of Object.entries(object)) {
   if (key.charAt(0) + key.charAt(1) === 'FR') {
      allParams.FR[key] = value;
   }
}

console.log(allParams)

