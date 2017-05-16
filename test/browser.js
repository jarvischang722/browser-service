const Browser = require('../src/schema/browser')

console.log(Browser.getVersion());
console.log(Browser.getVersion('windows', 'agtop'));
console.log(Browser.getVersion('windows'));
console.log(Browser.getVersion(null, 'agtop'));
console.log(Browser.getVersion('wrong'));
console.log(Browser.getVersion('wrong', 'agtop'));
console.log(Browser.getVersion(null, 'wrong'));
console.log(Browser.getVersion('windows', 'wrong'));
console.log(Browser.getVersion('wrong', 'wrong'));