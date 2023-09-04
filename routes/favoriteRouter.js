const express = require('express');
const Favorite = require('../models/favorite')
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route("/")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate("user")
            .populate("campsites")
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite)
            })

    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        const campsiteIds = req.body.map(sinc => sinc._id);
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    campsiteIds.forEach((campsiteId) => {
                        if (!favorite.campsites.includes(campsiteId)) {
                            favorite.campsites.push(campsiteId)
                        }
                    });

                    favorite.save()
                        .then(favorite => {
                            res.statusCode = 200,
                                res.setHeader("Content-Type", "application/json"),
                                res.json(favorite)

                        })
                        .catch(err => next(err))

                } else {
                    const newFavorite = new Favorite({
                        user: req.user._id,
                        campsites: campsiteIds,
                    });

                    newFavorite.save()
                        .then(favorite => {
                            res.statusCode = 200,
                                res.setHeader("Content-Type", "application/json")
                            res.json(favorite)
                        })
                        .catch(err => next(err))

                }


            })
            .catch(err => next(err))

    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.write('Put operation not supported on favorites ');   
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (res, req, next) => {
        const userId = req.user.id
        Favorite.findOneAndDelete({ user: userId })
            .then(favorite => {
                if (favorite) {
                    res.statusCode = 200,
                        res.setHeader('Content-Type', 'application/json'),
                        res.json(favorite)
                } else {
                    res.setHeader("Content-Type", "text/plain"),
                        res.write(" you don't have favorite do delete ")
                }
            })
            .catch(err => next(err))

    });

favoriteRouter.route("/:campsiteId")
    .options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        res.statusCode = 403;
        res.write('get operation not supported on favorites');

    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        const campsiteId = req.params
        const userId = req.user.id;
        Favorite.findOne({ user: userId })
            .then(favorite => {
                if (favorite.campsites.includes(campsiteId)) {
                    res.write('That campsite is already in the list of favorites!')

                } else {
                    favorite.campsites.push(campsiteId)
                }
                favorite.save()
                    .then(favorite => {
                        res.statusCode = 200,
                            res.json(favorite)
                    })
                    .catch(err => next(err))

                if (!favorite) {
                    return Favorite.create({ user: userId, campsites: [campsiteId] })
                }
            })
            .catch(err => next(err));



    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end(`Put operation is not supported on  favorites`);

    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (res, req, next) => {
        const userId = req.user._id;
        const campsiteId = req.params.campsiteId;

        Favorite.findOne({user:userId})
        .then(favorite=>{
            if(farotite){
                const campIndex= favorite.campsites.indexOf(campsiteId)
                if(campIndex===-1){
                    res.setHeader('Content-Type','text/plain')
                    res.write("campsite not found in favorite")
                }else{
                    favorite.campsites.splice(campIndex,1)
                }
            }

            favorite.save()
            .then(favorite=>{
                res.statusCode=200,
                res.setHeader('Content-Type','application/json'),
                res.json(favorite)

            })
            .catch(err=>next(err))

            if(!favorite){
                res.setHeader('Content-Type', 'text/plain'),
                res.write('No favorites to delete')

            }
        })
        .catch(err=>next(err))

    });

   module.exports = favoriteRouter;





