const mongoose = require('mongoose')

const bcrypt = require('bcrypt')
// salt 를 이용해 암호를 만듬
// salt 가 몇글자 인지 
const saltRounds = 10;

const jwt = require("jsonwebtoken");


const userSchema = mongoose.Schema({
    name:{
        type: String,
        maxlength: 50
    },
    email:{
        type: String,
        trim: true,
        unique: 1
    },
    password:{
        type: String,
        minlength: 5
    },
    role:{
        type:Number,
        default: 0
    },
    image:String,
    token: {
        type: String
    },
    tokenExp:{
        type: Number
    }
})

userSchema.pre('save', function(next){
    var user = this;
    if(user.isModified("password")){

        // 비밀번호를 암호화한다
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if (err) return next(err)
            
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return next(err)
                user.password = hash
                next()
            });
        });
    } else {
        next()
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb){
    // 플레인은 a12345678을 복호화 후 암호화된 비밀번호와 비교
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if (err) return cb(err)
        cb(null, isMatch)
    })
}

userSchema.methods.genToken = function(cb){
    var user = this;
    //jsonwebtoken 이용 해서 토큰 생성
    var token = jwt.sign(user._id.toHexString(),'usertoken');
    user.token = token
    user.save(function(err,user) {
        if(err) return cb(err)
        cb(null, user)
    })
}

userSchema.statics.findByToken = function(token,cb){
    var user = this;

    //토큰을 decode
    jwt.verify(token, 'usertoken', function(err, decode){
        // 유저아이디를 이용해서 유조룰 찾고 클라이언트에서 가져온 토큰과 디비에 보관된 토큰이 일치하는지 확인
        user.findOne({"_id":decode, "token":token}, function(err, user){
            if(err) return cb(err)
            cb(null, user)
        })
    })
}
const User = mongoose.model('User', userSchema)

module.exports= {User}