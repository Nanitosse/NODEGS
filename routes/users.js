const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');
const user = require('../models/user');

const router = express.Router();
// router.get('/', function (req, res, next) {
//     res.send('respond with a ressource');
// })
router.get('/', passport.authenticate('local'), passport.authenticate('verifyAdmin'), (req, res,) => {
    if (req.user.admin) {
        // return  User.findOne(userDoc) ;
        User.findOne({ username: 'admin' })
            .then(user => {
                if (user) {
                    console.log('User found:', user);
                    return user.Documents 
                } else {
                    console.log('User not found');
                }
            })
            .catch(error => {
                console.log('An error occurred:', error);
            });

    } else {
        res.status = 401
    }
})

router.post('/signup', (req, res) => {
    // User.register(
    //     new User({username: req.body.username}),
    //     req.body.password,
    //     (err, user) => {
    //         if (err) {
    //             res.statusCode = 500;
    //             res.setHeader('Content-Type', 'application/json');
    //             res.json({err: err});
    //         } else {
    //             if (req.body.firstname) {
    //                 user.firstname = req.body.firstname;
    //             }
    //             if (req.body.lastname) {
    //                 user.lastname = req.body.lastname;
    //             }
    //             user.save(err => {
    //                 if (err) {
    //                     res.statusCode = 500;
    //                     res.setHeader('Content-Type', 'application/json');
    //                     res.json({err: err});
    //                     return;
    //                 }
    //                 passport.authenticate('local')(req, res, () => {
    //                     res.statusCode = 200;
    //                     res.setHeader('Content-Type', 'application/json');
    //                     res.json({success: true, status: 'Registration Successful!'});
    //                 });
    //             });
    //         }
    //     }
    // );
    User.register(
        new User({ username: req.body.username }),
        req.body.password,
        (err, user) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({ err: err });

            } else {
                if (req.body.firstname) {
                    user.firstname = req.body.firstname;
                }
                if (req.body.lastname) {
                    user.lastname = req.body.lastname;
                }
                user.save(err => {
                    if (err) {
                        res.statusCode = 500;
                        res.setHeader("Content-Type", 'appliocation/json');
                        res.json({ err: err })
                    }
                    passport.authenticate('local')(req, res, () => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({ success: true, status: 'Registration succesful ' })
                    })
                })

            }
        }

    )





});

router.post('/login', passport.authenticate('local'), (req, res, next) => {
    const token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, token: token, status: 'You are successfully logged in!' });
});
// router.post('/login', passport.authenticate('local'), (req, res, ) => {
//    res.statusCode=200;
//    res.setHeader('Content-Type', 'application/json');
//    res.json({success:true, status:'You are succesfully logged in!'})

// })

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
router.get('/', (req, res, next) => {
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

// router.get('/', (req,res,)=>{
//     if(req.user.admin){
//         return res.json(userDocuments)

//     }else{
//         res.status=401
//     }
// })


module.exports = router;