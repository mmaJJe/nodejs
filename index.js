const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const { User } = require('./models/User');
const { auth } = require('./middleware/auth');

const config = require("./config/key")

//x-www-form 형식의 데이터 받는 칸
app.use(bodyParser.urlencoded({extended:true}));
//json 타입 데이터 받는 칸
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex: true, useFindAndModify: true
}).then(()=> console.log('mongoDb connect'))
  .catch(err => console.log(err))


app.get('/', (req, res) => res.send("hello world!"))

app.post('/api/user/register', (req, res)=> {
    // 회원가입할때 필요한 정보들을 클라이언트에서 가져오면 
    // 그것을 데이터베이스에 넣는다.
    const user = new User(req.body)
    user.save((err, userInfo)=> {
        if(err) return res.json({success: false, err})
        return res.status(200).json({
            success: true
        })
    })
})

app.post('/api/user/login', (req, res) =>{

    // 요청된 이메일을 데이터베이스에서 있는지 찾는다.
    User.findOne({email:req.body.email}, (err, user) =>{
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "이메일과 일치하는 유저가 없습니다"
            })
        }

        // 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는지 확인
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch) return res.json({loginSuccess:false, message:"비번 틀림"})
            
            // 비밀번호가 맞다면 유저를 위한 토큰 생성
            user.genToken((err,user)=>{
                if(err) return res.status(400).send(err);
                // 토큰을 저장한다, (쿠키(선택), 로컨저장소,)
                res.cookie("x_auth", user.token) 
                .status(200)
                .json({loginSuccess: true, userId:user._id})

            })
        })
    })
})


app.get('/api/user/auth', auth , (req,res) => {
    //여기까지 미들웨어를 통과 했다는 얘기는 Auth가  true통과 했다는 것
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email:req.user.email,
        name:req.user.name,
        image:req.user.image
    })  
})

app.get('/api/user/logout', auth ,(req,res)=>{
    User.findOneAndUpdate({_id:req.user._id},
        {token:""},
        (err,user)=>{
        if(err) return res.json({success:false, err});
        return res.status(200).send({
            success:true
        })
    })
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))

