const imageSizes = [
   {
      size: 'large',
      width: 1280,
   },
   {
      size: 'medium',
      width: 800,
      height: 800
   },
   {
      size: 'small',
      width: 400,
      width: 400,
   },
   {
      size: 'thumb',
      width: 200,
      width: 200,
   },
]


let image = 'doge.jpg';

imageSizes.forEach(size => {
   let newName = image.split('.');
   newName[0] =`${newName[0]}-${size.size}`;
   newName = newName.join('.');


   
})