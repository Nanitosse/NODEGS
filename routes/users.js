const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');

const router = express.Router();

router.post('/signup', (req, res) => {
    User.register(
        new User({username: req.body.username}),
        req.body.password,
        err=>{
            if(err){
                res.statusCode=500;
                res.setHeader('Content-Type', 'application/json');
                res.json({err:err});
            }else{
                passport.authenticate('local')(req,res,()=>{
                    res.statusCode=200;
                    res.setHeader('content-type', 'application/json');
                    res.json({success:true,status: 'Registration Successful!'});

                });
            }

        }



    );
   
});

router.post('/login', passport.authenticate('local'), (req, res) => {
    const token = authenticate.getToken({_id:req.user.id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token:token, status: 'You are successfully logged in!'});
});

router.get('/logout', (req, res, next) => {
    if (req.session) {
        req.session.destroy();
        res.clearCookie('session-id');
        res.redirect('/');
    } else {
        const err = new Error('You are not logged in!');
        err.status = 401;
        return next(err);
    }
});
router.get('/', (req, res, next)=>{ 
    if (req.session.views) {
      req.session.views++
      res.setHeader('Content-Type', 'text/html')
      res.write('<p>views: ' + req.session.views + '</p>')
      res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
      res.end()
    } else {
      req.session.views = 1
      res.end('welcome to the session demo. refresh!')
    }
  })


module.exports = router;