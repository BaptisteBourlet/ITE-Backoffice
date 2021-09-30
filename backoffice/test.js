let string = 'asasdsa\\';
let regEx = new RegExp("\\\\", "g");

console.log(regEx.test(string));