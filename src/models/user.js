import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import Jwt from 'jsonwebtoken'; // 토큰 발급!

const UserSchema = new Schema({
    username: String,
    hashedPassword: String,
});

UserSchema.methods.setPassword = async function (password) {
    const hash = await bcrypt.hash(password, 10);
    this.hashedPassword = hash; // this: 문서 인스턴스
};
UserSchema.methods.checkPassword = async function (password) {
    const result = await bcrypt.compare(password, this.hashedPassword);
    return result; // true / false
};

UserSchema.methods.serialize = function () {
    const data = this.toJSON();
    delete data.hashedPassword;
    return data;
};

// 토큰 발급!
UserSchema.methods.generateToken = function () {
    const token = Jwt.sign(
        // 첫 번째 파라미터에는 토큰 안에 집어넣고 싶은 데이터를 삽입
        {
            _id: this.id,
            username: this.username,
        },
        process.env.JWT_SECRET, // 두 번째 파라미터에는 JWT암호를 삽입
        {
            expiresIn: '7d',
        },
    );
    return token;
};

UserSchema.statics.findByUsername = function (username) {
    return this.findOne({ username });
};

const User = mongoose.model('User', UserSchema);
export default User;
