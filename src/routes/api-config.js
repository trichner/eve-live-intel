
var passport = require('passport')
var OAuth2Strategy = require('passport-oauth2').Strategy;
var session = require('express-session');
var eveHeader = require('eve-header');
var FileStore = require('session-file-store')(session);
var minions = require('./../minions/Minions');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var service = require('./../minions/service');

function setupMiddleware(app){
    // API Middleware
    var credentials = minions.getEveSSOCredentials();
    passport.serializeUser(function(pilot, done) {
        done(null, pilot.id);
    });

    passport.deserializeUser(function(pilotId, done) {
        service.findPilot(pilotId)
            .then(function (pilot) {
                if(pilot){
                    done(null, pilot);
                }else{
                    done(new Error('Session not established'),null);
                }
            })
    });
    passport.use(new OAuth2Strategy({
            authorizationURL: 'https://login.eveonline.com/oauth/authorize',
            tokenURL: 'https://login.eveonline.com/oauth/token',
            clientID: credentials.clientID,
            clientSecret: credentials.clientSecret,
            callbackURL: "https://k42.ch/nemesis/api/auth/callback",
            passReqToCallback: true
        },
        function(req,accessToken, refreshToken, profile, done) {
            console.log('Session:' + JSON.stringify(req.session))
            console.log("ACCESSTOKEN: " + accessToken);
            service.createPilot(accessToken)
                .then(function (pilot) {
                    console.log('Pilot:' + JSON.stringify(pilot))
                    req.session.verified = true;
                    req.session.pilotId = pilot.id;
                    done(null, pilot);
                }, function (err) {
                    console.log('FAIL: ' + err)
                    done(err, null);
                })
        }
    ));

    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false, type: 'application/x-www-form-urlencoded' }));
    app.use(eveHeader);
    app.use(session({
        secret: minions.getSessionSecret(),
        store: new FileStore()
    }))
    app.use(passport.initialize());
    app.use(passport.session());

    app.get('/auth', passport.authenticate('oauth2'));
    app.get('/auth/callback',
        passport.authenticate('oauth2',{
            successRedirect : '/nemesis/',
            failureRedirect : '/nemesis/'
        }));


    /* DELETE logout*/
    app.delete('/auth', function(req, res, next) {
        req.session.destroy(function(err){
            if(err){
                var err = new Error('Cannot logout')
                err.status = 500;
                next(err);
            }else{
                res.status(200).end();
            }
        })
    });

    app.use(function(req, res, next) {
        if(req.isAuthenticated()){
            next();
        }else{
            var err = new Error('Please authenticate.')
            err.status = 401;
            return next(err);
        }
    })
}

module.exports = {
    setupMiddleware : setupMiddleware
}

