var express = require('express');
var router = express.Router();

var admin = require('firebase-admin')
var serviceAccount = require('../forpet-14493-firebase-adminsdk-8je27-3148c5f1bf');

var FCM = require('fcm-node');

var firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://forpet-14493.firebaseio.com'
});

var serverKey = "AAAAXR1-O1Q:APA91bEh1-WhOx-Jp3L5iFNZUb9iRXnIISBiJlwuwz7EROskEzqUjmoQz1er9gfhRwMAOWG9TGG0rDXywn6rdabJOGbVFtOJ3WPa19gH9XkC3XK8om676AiH3UfgpwJG9bQ3OV6OubBY";

// var client_token = 'fCfVzlhF50Q:APA91bECSDkr04TVzmI-Rtd1cxIGBHEuDYCZyvOuc254mx-AwtIZkiOw22y7fDv1uYbWuxbzXwwn6fv_Ut7n2_-LcLN3heohBV20MG_uFWsHm8dw2bMX9oRI10BQPNeXqMaaf8_Fhopi';

/** 발송할 Push 메시지 내용 */

var id = 0;
// var weight = 0;
// var motor = 0;
// var date = new Date();
// console.log(date.getFullYear()); // return fullyear
// console.log(date.getMonth()); //return month -1
// console.log(date.getDate()); // return Date
// console.log(date.getDay()); // return Day 0,1,2,3,4,5,6 일~월


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

router.get('/sound/:address', function(req,res,next){
  var isBarking;
  // firebaseAdmin.database().ref(`sound/${req.params.address}`).once('value', function(snapshot) {
  //   if(snapshot.exists()){
  //     console.log(snapshot.exists())
  //     isBarking = snapshot.val().isBarking;
  //     console.log(motor);
  //     res.json([
  //       {
  //         isBarking: isBarking
  //       }
  //     ]);
  //   }else{
  //     console.log(snapshot.exists())
  //     res.json([
  //       {
  //         isBarking: 0
  //       }
  //     ]);
  //   }
  // }).then(()=>{
  //   firebaseAdmin.database().ref(`motor/${req.params.address}`).set({isBarking: 0});
  // });
});

router.get('/motor/:address', function(req, res, next) {
  var motor;
  firebaseAdmin.database().ref(`motor/${req.params.address}`).once('value', function(snapshot) {
    if(snapshot.exists()){
      console.log(snapshot.exists())
      motor = snapshot.val().isRotation;
      console.log(motor+"motor");
      res.json([
        {
          motor: motor
        }
      ]);
    }else{
      console.log(snapshot.exists() + "not ex");
      res.json([
        {
          motor: 0
        }
      ]);
    }
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
  console.log(req.params.weight);
  
  // firebaseAdmin.database().ref(`weight/${req.params.address}/${Date.now()}`).set({weight: Number(req.params.weight)});

  //set now weight
  var number = 0;
  //set now date
  var push_data = {
      // 수신대상
      to: '/topics/'+req.params.address.replace(/:/g, ""),
      // App이 실행중이지 않을 때 상태바 알림으로 등록할 내용
      notification: {
          title: "사료가 얼마 남지 않았습니다!",
          body: "현재 남은 사료량은"+req.params.weight+"g입니다!",
          sound: "custom_sound.mp3",
          // click_action: "FCM_PLUGIN_ACTIVITY",
          // icon: "fcm_push_icon"
      },
      // 메시지 중요도
      // priority: "high",
      // App 패키지 이름
      // restricted_package_name: "io.ionic.starter",
      // App에게 전달할 데이터
      data: {
          num1: 2000,
          num2: 3000
      }
  };

  /** 아래는 푸시메시지 발송절차 */
  var fcm = new FCM(serverKey);


  //50%이하로 사료가 남으면  FCM메시지 전달!
  if(req.params.weight/64 * 100 < 50){
    fcm.send(push_data, function(err, response) {
      console.log(push_data.to);
        if (err) {
            console.error('Push메시지 발송에 실패했습니다.');
            console.error(err);
            return;
        }

        console.log('Push메시지가 발송되었습니다.');
        console.log(response);
    });
  }
  
  firebaseAdmin.database().ref(`nowweight/${req.params.address}`).once('value', snapshot=>{
    if(snapshot.exists()){
      console.log(snapshot.exists())
      if(req.params.weight < snapshot.val().weight){
        firebaseAdmin.database().ref(`weight/${req.params.address}/${date.getFullYear()}${date.getMonth()+1}${date.getDate()-number}/${date.getHours()}${date.getMinutes()}${date.getMilliseconds()}`)
        .set({weight: Number( snapshot.val().weight-req.params.weight)});
      }else{
        firebaseAdmin.database().ref(`weight/${req.params.address}/${date.getFullYear()}${date.getMonth()+1}${date.getDate()-number}/${date.getHours()}${date.getMinutes()}${date.getMilliseconds()}`)
        .set({weight: Number(0)});
      }
    }
  }).then(()=>{firebaseAdmin.database().ref(`nowweight/${req.params.address}`).set({weight: Number(req.params.weight)})});
  //get weight over date
  
  firebaseAdmin.database().ref(`weight/${req.params.address}/${date.getFullYear()}${date.getMonth()+1}${date.getDate()-number}`).once('value', snapshot=>{
    if(snapshot.exists()){
      console.log(snapshot.exists())
      var sum = 0;
      snapshot.forEach(day=>{
        sum += day.val().weight;
      });
      //set weight in db
      firebaseAdmin.database().ref(`averageweight/${req.params.address}/${date.getFullYear()}${date.getMonth()+1}${date.getDate()-number}`).set({weight: sum});
    }
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
