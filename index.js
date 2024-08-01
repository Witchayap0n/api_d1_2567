const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const expressFileupload = require('express-fileupload')
const cors = require('cors')
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// Set up Global configuration access
dotenv.config();

const knex = require('knex')({
    client: 'mysql',
    connection: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'member'
    }
})
app.use(cors())
app.use(bodyParser.json())// ใช้ได้ทุก url
const port = 7000

app.get('/listid',async (req, res) => {
  console.log('email=',  req.query)
  let ids = await knex("users")
      .where({email: req.query.email})
  res.send({
      row: ids[0],
      status: 'ok'
  })
})

app.post('/login',async (req, res) => {
  console.log(req.body)
    if(req.body.email == ''|| req.body.passwd == ''){
      return res.send({
          message:"กรุณาตรวจสอบ Username และ Password ต้องไม่ใช่ค่าว่าง",
          status: 'fail'
      })
    }
    
  console.log('Next Step 2')
  let ids = await knex('users')
    .where({
      email: req.body.email,
      password: req.body.passwd,
    })
    console.log(ids.length)
    if(ids.length == 0){
      return res.send({
        message:"กรุณาตรวจสอบ Username และ Password ให้ถูกต้อง",
        status: 'error_user',
      })
    }

  console.log('Next Step 3 success')
  res.send({
    message:"Login สำเร็จ",
    status: 'ok',
    row:ids
  })

})

app.get('/', (req, res) => {
    console.log(req, res)
    res.send({
      status: 'chaiyaphum',
      data : req.query
    })
})

app.post('/update',async (req, res) => {
    console.log(req.body.id)
    let username = req.body.username
    let password = req.body.password
    let email = req.body.email
    try {
      let ids = await knex('users')
      .where({id: req.body.id})
      .update({username: username,password: password,email: email })
      res.send({
        status: 'ok',
        data: req.body
      })
    } catch (error) {

    }
    
    
      
    })
app.post('/insert',async (req,res) =>{
    console.log(req.body)
    let username = req.body.username
    let password = req.body.password
    let email = req.body.email
    let picture = req.body.picture
    let status = req.body.status
  
        try {
          let ids = await knex('users').insert({
          username:username,
          password: password,
          email: email,
          picture: picture,
          status: status,
      });
          res.send({
          status : 'ok',
          id : ids[0],
        });
        } catch (e) {
        res.send({
          status: 0 ,
          error : e.message
      
        })
        }
      });
 //ลบ
app.get('/delete', async (req, res) => {
    try {
        console.log(req.query)
        let id = req.query.id
        await knex('users').where('id',id).del();
        
        res.send({
        ok: 'yes',
        })
        } catch (e) {
            res.send({
            ok : 0,
            error : e.message
            })
        }
    
})

app.post('/search', async (req, res) => {
  console.log(req.body)
  let id = req.body.id
  try {
      let row = await knex('users').where({ id: id }).select()
      res.send({
          ok: 'yes',
          rows: row
      })
  } catch (error) {
      res.send({
          ok: '0',
          error: error.message
      })
  }
})
     

app.get('/list', async function (req, res) {
    try {
        let row = await knex('users')
    res.send({
        ok : 'yes' ,
        rows : row
    })
    } catch (e) {
      res.send({
        ok : 0 ,
        error: e.message
      })
    }
})
app.get('/register', (req, res) => {
    res.send('ลงทะเบียน!')
})

app.listen(port, function() {
  console.log(`Example app listening on port ${port}`)
})

// Main Code Here //
// Generating JWT
app.post("/user/generateToken", (req, res) => {
  // Validate User Here
  // Then generate JWT Token

  let jwtSecretKey = process.env.JWT_SECRET_KEY;
  let data = {
      time: Date(),
      userId: 12,
  }

  const token = jwt.sign(data, jwtSecretKey);
  console.log("token=",token)

  res.send(token);
});

// Verification of JWT
app.get("/user/validateToken", (req, res) => {
  // Tokens are generally passed in header of request
  // Due to security reasons.

  let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
  let jwtSecretKey = process.env.JWT_SECRET_KEY;

  try {
      const token = req.header(tokenHeaderKey);

      const verified = jwt.verify(token, jwtSecretKey);
      if (verified) {
          return res.send("Successfully Verified");
      } else {
          // Access Denied
          return res.status(401).send(error);
      }
  } catch (error) {
      // Access Denied
      return res.status(401).send(error);
  }
});