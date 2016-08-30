/**
 * Created by bln on 16-7-6.
 */
const cluster = require('cluster');

console.log('a');
if(cluster.isMaster){
    console.log('I am Master');
    let c = cluster.fork();
}else{
    console.log('I am Worker');
}
console.log('b');

try{
    let c = '1';
}catch (err){
    console.log(err);
}

console.log(c);