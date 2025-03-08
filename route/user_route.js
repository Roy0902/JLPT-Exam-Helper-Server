import {pool} from '../config/db.js';
import {app} from '../config/app.js';
import bcrypt, { hash } from 'bcrypt';
import {v4 as uuidv4} from 'uuid';
import {sequelize} from '../config/db.js';

function init(){
    signIn();
    signUp();
    checkEmail();
    resetPassword();
    test();
}

function signIn(){
    app.post(`/signIn`, async (req,res) => {
        try {
            const query = 'SELECT PASSWORD_HASH FROM Account WHERE EMAIL = ?';
            const params = [req.body.email];
      
            const results = await pool.query(query, params);
      
            if (results[0].length > 0) {
                const match = await bcrypt.compare(req.body.password, results[0][0].PASSWORD_HASH);
                if(match){
                    res.json({"code": "200", 
                              "message": "Sign In Successfully.", 
                              "data": "" });
                }else{
                    res.json({"code": "401", 
                              "message": "Failed.",
                              "data": "" });
                }
            }else{
                res.json({"code":"401" ,
                          "message": "Failed.",
                          "data": "" });
            }
        }catch (error) {
          res.status(500).send('Unknown error.');
        }
    });
}

function signUp(){
    app.post(`/signUp`, async (req,res) => {
        try {
            var token = {
                token: "",
                email: ""
            }
            var message = "";
            const duplicateUserName = await findUserName(req.body.userName);
            const duplicateEmail = await findEmail(req.body.email)
            if(duplicateUserName){
                message += "User name existed;";
            }
            if(duplicateEmail ){
                message += "Email existed;";
            }

            if(message.length > 0){
                res.json({"code": "409" , 
                          "message": message, 
                          "data": token });
            }else{
                await createAccount(req.body.userName, req.body.email, req.body.password)

                res.json({"code": "201" , 
                          "message": "Created Account", 
                          "data": token });
            }
        }catch (error) {
          res.status(500).send('Unknown error.');
        }
    });
}

function checkEmail(){
    app.post(`/findEmail`, async (req,res) => {
        try {
            const duplicateEmail = await findEmail(req.body.email)
            if(!duplicateEmail){
                res.json({"code": "404" , 
                          "message": "Email not found", 
                          "data": ""});
            }else{
                res.json({"code": "200" , 
                          "message": "Email found", 
                          "data": ""});
            }
        }catch (error) {
          res.status(500).send('Unknown error.');
        }
    });
}

function resetPassword(){
    app.post(`/changePassword`, async (req,res) => {
        try {
            const updatePw_result = updatePassword(req.body.email, req.body.password)
            if(updatePw_result){
                res.json({"code": "200" , 
                          "message": "Email found", 
                          "data": ""});

            }else{
                res.json({"code": "404" , 
                          "message": "Email not found", 
                          "data": ""});
            }
        }catch (error) {
          res.status(500).send('Unknown error.');
        }
    });
}

async function findUserName(userName) {
    const query = 'SELECT COUNT(*) AS count FROM Account WHERE USER_NAME = ? ';
    const params = [userName];
    const results = await pool.query(query, params);
    const count = results[0][0].count;
    return count > 0;
}

async function findEmail(email) {
    const query = 'SELECT COUNT(*) AS count FROM Account WHERE EMAIL = ? ';
    const params = [email];
    const results = await pool.query(query, params);
    const count = results[0][0].count;
    return count > 0;
}

async function createAccount(userName, email, password) {
    const query = 'INSERT INTO ACCOUNT VALUES(?, ?, ?, ?) ';
    const accountId = uuidv4();
    const password_hash = await hashPassword(password);
    const params = [accountId, userName, email, password_hash];
    await pool.query(query, params);
}

async function hashPassword(password) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const password_hash = await bcrypt.hash(password, salt);

    return password_hash;
}

async function updatePassword(email, password) {
    const password_hash = await hashPassword(password);
    const query = 'UPDATE ACCOUNT SET PASSWORD_HASH = ? WHERE EMAIL = ? ';
    const params = [password_hash, email];

    const results = await pool.query(query, params);
    console.log(results)
    return results[0].affectedRows > 0;
}

async function test(){
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
}

export {init}