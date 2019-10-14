var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const { User, Band } = require('./sequelize')

// invoke an instance of express application.
var app = express();

// set our application port
app.set('port', 9000);

// initialize body-parser to parse incoming parameters requests to req.body
app.use(bodyParser.urlencoded({ extended: true }));

// initialize cookie-parser to allow us access the cookies stored in the browser. 
app.use(cookieParser());

app.set("view engine", "hbs");
// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
    key: 'user_id',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
    if (req.cookies.user_id && !req.session.user) {
        console.log("hello..")
        res.clearCookie('user_id');        
    }
    next();
});


// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_id) {
        res.redirect('/dashboard');
    } else {
        next();
    }    
};


// route for Home-Page
app.get('/', sessionChecker, (req, res) => {
   res.redirect('/login');
});


// route for user signup
app.route('/signup')
    .get(sessionChecker, (req, res) => {
       res.render("signup");
    })
    .post((req, res) => {
        console.log(req.body)
        User.create({
            name: req.body.username,
            email: req.body.email,
            password: req.body.password,
            company: req.body.company,
            dateOfBirth:req.body.date
        })
        .then(user => {
            
            console.log(user.dataValues);
            req.session.user = user.dataValues;
            res.redirect('/dashboard')
  
        })
        .catch(error => {
            res.redirect('/signup');
        });
    });


// route for user Login
app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.render("login");
    })
    .post((req, res) => {
        var username = req.body.username,
            password = req.body.password;

        User.findOne({ where: { name: username , password: password} }).then(function (user) {

            if (!user) {
                res.render('login',{
                    error: 'username or password incorrect..try again'
                });
            } 
            //else if (!user.validPassword(password)) {
            //     res.redirect('/login');
           // } 
            else {
                req.session.user = user.dataValues;
                res.redirect('/dashboard');
            }
        });
    });


// route for user's dashboard
app.get('/dashboard', (req, res) => {
    if (req.session.user && req.cookies.user_id) {

        Band.findAll({ where: {   userId: req.session.user.id } }).then(
            bands => {
            // bands.map(u => u.get({plain: true}))
           JSON.parse(JSON.stringify(bands));
            res.render("dashboard", {
                name: req.session.user.name,
                bandList:bands
                
              });
        });

    } else {
        res.redirect('/login');
    }
});

//route for create band
app.get('/createband', (req, res) => {
    if (req.session.user && req.cookies.user_id) {
        res.render("createband", {
            name: req.session.user.name
          });
    } else {
        res.redirect('/login');
    }});

  app.post('/createband',(req, res) => {
      Band.create({
          name: req.body.bandname,
          description: req.body.description,
          userId: req.session.user.id
      })
      .then(band => {
          res.redirect('/dashboard')
      })
      .catch(error => {
          res.redirect('/signup');
      });
  });

//route for update band
app.post('/update',(req, res) => {
    if (req.session.user && req.cookies.user_id) {
      Band.update({
            name: req.body.name,
            description: req.body.description
          }, {
            where: {  id: req.body.id }
          }).then(  bands=>{
            JSON.parse(JSON.stringify(bands)) ;
            res.redirect('/dashboard');
          });
    } else {
        res.redirect('/login');
    }
  });

  //route for delete band
  app.post('/delete',(req, res) => {
    if (req.session.user && req.cookies.user_id) {
       Band.destroy({
        where: {
          id: req.body.id
        }
      }).then(  bands=>{
        JSON.parse(JSON.stringify(bands)) ;
        res.redirect('/dashboard');
          });

    } else {
        res.redirect('/login');
    }
  });


// route for user logout
app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_id) {
        res.clearCookie('user_id');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

// route for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
});


// start the express server
app.listen(app.get('port'), () => console.log(`App started on port ${app.get('port')}`));