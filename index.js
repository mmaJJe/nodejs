const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const {User} = require('./models/User');

const config = require("./config/key")

//x-www-form 형식의 데이터 받는 칸
app.use(bodyParser.urlencoded({extended:true}));
//json 타입 데이터 받는 칸
app.use(bodyParser.json());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex: true, useFindAndModify: true
}).then(()=> console.log('mongoDb connect'))
  .catch(err => console.log(err))


app.get('/', (req, res) => res.send("hello world!1"))

app.post('/register', (req, res)=> {
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

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

