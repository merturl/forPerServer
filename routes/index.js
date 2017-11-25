var express = require('express');
var router = express.Router();

var admin = require('firebase-admin')
var serviceAccount = require('../forpet-14493-firebase-adminsdk-8je27-3148c5f1bf');

var firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://forpet-14493.firebaseio.com'
});



var id = 0;
// var weight = 0;
// var motor = 0;
var date = new Date();
console.log(date.getFullYear()); // return fullyear
console.log(date.getMonth()); //return month -1
console.log(date.getDate()); // return Date
console.log(date.getDay()); // return Day 0,1,2,3,4,5,6 일~월


/* GET home page. */
router.get('/', function(req, res, next) {  
  console.log(id, weight);
  res.json([
    {
      id: id
    }
  ]);
  if(res){
    id++;
  }
  
  
});

router.get('/motor/:address', function(req, res, next) {
  var motor;
  firebaseAdmin.database().ref(`motor/${req.params.address}`).once('value', function(snapshot) {
    motor = snapshot.val().isRotation;
    console.log(motor);
    res.json([
      {
        motor: snapshot.val().isRotation
      }
    ]);
  }).then(()=>{
    firebaseAdmin.database().ref(`motor/${req.params.address}`).set({isRotation: 0});
  });
  // if(motor == 1){
  //   motor = 0;
  // }else {
  //   motor = 1;
  // }
  // firebaseAdmin.database().ref('weight/00:30:f9:13:c3:de').child(new Date().toStrin  g()).set({
  //   weight: motor
  // });
});

router.get('/weight/:weight/:address', function(req, res, next) {
  var date = new Date();
  
  // firebaseAdmin.database().ref(`weight/${req.params.address}/${Date.now()}`).set({weight: Number(req.params.weight)});

  //set now weight
  firebaseAdmin.database().ref(`nowweight/${req.params.address}/${Date.now()}`).set({weight: Number(req.params.weight)});
  var number = -1;
  //set now date  
  firebaseAdmin.database().ref(`weight/${req.params.address}/${date.getFullYear()}${date.getMonth()}${date.getDate()-number}/${date.getHours()}${date.getMinutes()}${date.getMilliseconds()}`).set({weight: Number(req.params.weight)});
  //get weight over date
  firebaseAdmin.database().ref(`weight/${req.params.address}/${date.getFullYear()}${date.getMonth()}${date.getDate()-number}`).once('value', snapshot=>{
    var sum = 0;
    snapshot.forEach(day=>{
      sum += day.val().weight;
    });
    //set weight in db
    console.log(sum + "hello");
    firebaseAdmin.database().ref(`averageweight/${req.params.address}/${date.getFullYear()}${date.getMonth()}${date.getDate()-number}`).set({weight: sum/snapshot.numChildren()});
  });
  res.send();
});

router.post('/weight', function(req, res, next){
  let weight = req.body.weight;
  id++;
  console.log("Post : "+ req.body.weight + ", id : " + id);
  // res.json([
  //   {
  //     motor: motor
  //   }
  // ]);
  
});

  
router.post('/home', function(req, res, next) {
  var weight = req.body.weight;
  console.log(weight);
  res.send();
});

module.exports = router;
