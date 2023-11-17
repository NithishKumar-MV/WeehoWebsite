"use strict";

var express = require('express');

var cors = require('cors');

var mongoose = require('mongoose');

var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');

var User = require('./models/User.js');

var Place = require('./models/Place.js');

var Booking = require('./models/Booking.js');

var cookieParser = require('cookie-parser');

var Razorpay = require('razorpay');

var shortid = require('shortid');

var bodyParser = require('body-parser');

var imageDownloader = require('image-downloader');

var multer = require('multer');

var fs = require('fs');

require('dotenv').config();

var app = express();
var bcryptSalt = bcrypt.genSaltSync(10);
var jwtSecret = 'fasefraw4r5r3wq45wdfgw34twdfg';
var razorpay = new Razorpay({
  key_id: 'rzp_test_4AAfE1spa0SuuG',
  key_secret: 'LmVk3BAP6wDjj4Ls9Jw7onuU'
});
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use('/uploads', express["static"](__dirname + '/uploads'));
app.use(cors({
  credentials: true,
  origin: 'http://localhost:5173'
}));
mongoose.connect(process.env.MONGO_URL);

function getUserDataFromReq(req) {
  return new Promise(function (resolve, reject) {
    jwt.verify(req.cookies.token, jwtSecret, {}, function _callee(err, userData) {
      return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!err) {
                _context.next = 2;
                break;
              }

              throw err;

            case 2:
              resolve(userData);

            case 3:
            case "end":
              return _context.stop();
          }
        }
      });
    });
  });
}

app.get('/test', function (req, res) {
  res.json('test ok');
});
app.post('/register', function _callee2(req, res) {
  var _req$body, name, email, password, userDoc;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body = req.body, name = _req$body.name, email = _req$body.email, password = _req$body.password;
          _context2.prev = 1;
          _context2.next = 4;
          return regeneratorRuntime.awrap(User.create({
            name: name,
            email: email,
            password: bcrypt.hashSync(password, bcryptSalt)
          }));

        case 4:
          userDoc = _context2.sent;
          res.json(userDoc);
          _context2.next = 11;
          break;

        case 8:
          _context2.prev = 8;
          _context2.t0 = _context2["catch"](1);
          res.status(422).json(_context2.t0);

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[1, 8]]);
});
app.post('/login', function _callee3(req, res) {
  var _req$body2, email, password, userDoc, passOk;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _req$body2 = req.body, email = _req$body2.email, password = _req$body2.password;
          _context3.next = 3;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }));

        case 3:
          userDoc = _context3.sent;

          if (userDoc) {
            passOk = bcrypt.compareSync(password, userDoc.password);

            if (passOk) {
              jwt.sign({
                email: userDoc.email,
                id: userDoc._id
              }, jwtSecret, {}, function (err, token) {
                if (err) throw err;
                res.cookie('token', token).json(userDoc);
              });
            } else {
              res.status(422).json('pass not ok');
            }
          } else {
            res.json('not found');
          }

        case 5:
        case "end":
          return _context3.stop();
      }
    }
  });
});
app.get('/profile', function (req, res) {
  var token = req.cookies.token;

  if (token) {
    jwt.verify(token, jwtSecret, {}, function _callee4(err, userData) {
      var _ref, name, email, _id;

      return regeneratorRuntime.async(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (!err) {
                _context4.next = 2;
                break;
              }

              throw err;

            case 2:
              _context4.next = 4;
              return regeneratorRuntime.awrap(User.findById(userData.id));

            case 4:
              _ref = _context4.sent;
              name = _ref.name;
              email = _ref.email;
              _id = _ref._id;
              res.json({
                name: name,
                email: email,
                _id: _id
              });

            case 9:
            case "end":
              return _context4.stop();
          }
        }
      });
    });
  } else {
    res.json(null);
  }
});
app.post('/logout', function (req, res) {
  res.cookie('token', '').json(true);
});
console.log({
  __dirname: __dirname
});
app.post('/upload-by-link', function _callee5(req, res) {
  var link, newName;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          link = req.body.link;
          newName = 'photo' + Date.now() + '.jpg';
          _context5.next = 4;
          return regeneratorRuntime.awrap(imageDownloader.image({
            url: link,
            dest: __dirname + '/uploads/' + newName
          }));

        case 4:
          res.json(newName);

        case 5:
        case "end":
          return _context5.stop();
      }
    }
  });
});
var photosMiddleware = multer({
  dest: 'uploads'
});
app.post('/upload', photosMiddleware.array('photos', 100), function (req, res) {
  var uploadedFiles = [];

  for (var i = 0; i < req.files.length; i++) {
    var _req$files$i = req.files[i],
        path = _req$files$i.path,
        originalname = _req$files$i.originalname;
    var parts = originalname.split('.');
    var ext = parts[parts.length - 1];
    var newPath = path + '.' + ext;
    fs.renameSync(path, newPath);
    uploadedFiles.push(newPath.replace('uploads', ''));
  }

  res.json(uploadedFiles);
});
app.post('/places', function (req, res) {
  var token = req.cookies.token;
  var _req$body3 = req.body,
      title = _req$body3.title,
      address = _req$body3.address,
      addedPhotos = _req$body3.addedPhotos,
      description = _req$body3.description,
      price = _req$body3.price,
      extraInfo = _req$body3.extraInfo,
      date = _req$body3.date,
      time = _req$body3.time,
      maxParticipants = _req$body3.maxParticipants;
  jwt.verify(token, jwtSecret, {}, function _callee6(err, userData) {
    var placeDoc;
    return regeneratorRuntime.async(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            if (!err) {
              _context6.next = 2;
              break;
            }

            throw err;

          case 2:
            _context6.next = 4;
            return regeneratorRuntime.awrap(Place.create({
              owner: userData.id,
              price: price,
              title: title,
              address: address,
              photos: addedPhotos,
              description: description,
              extraInfo: extraInfo,
              date: date,
              time: time,
              maxParticipants: maxParticipants
            }));

          case 4:
            placeDoc = _context6.sent;
            res.json(placeDoc);

          case 6:
          case "end":
            return _context6.stop();
        }
      }
    });
  });
});
app.get('/user-places', function (req, res) {
  var token = req.cookies.token;
  jwt.verify(token, jwtSecret, {}, function _callee7(err, userData) {
    var id;
    return regeneratorRuntime.async(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            id = userData.id;
            _context7.t0 = res;
            _context7.next = 4;
            return regeneratorRuntime.awrap(Place.find({
              owner: id
            }));

          case 4:
            _context7.t1 = _context7.sent;

            _context7.t0.json.call(_context7.t0, _context7.t1);

          case 6:
          case "end":
            return _context7.stop();
        }
      }
    });
  });
});
app.get('/places/:id', function _callee8(req, res) {
  var id;
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          id = req.params.id;
          _context8.t0 = res;
          _context8.next = 4;
          return regeneratorRuntime.awrap(Place.findById(id));

        case 4:
          _context8.t1 = _context8.sent;

          _context8.t0.json.call(_context8.t0, _context8.t1);

        case 6:
        case "end":
          return _context8.stop();
      }
    }
  });
});
app.put('/places', function _callee10(req, res) {
  var token, _req$body4, id, title, address, addedPhotos, description, extraInfo, date, time, maxParticipants, price;

  return regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          token = req.cookies.token;
          _req$body4 = req.body, id = _req$body4.id, title = _req$body4.title, address = _req$body4.address, addedPhotos = _req$body4.addedPhotos, description = _req$body4.description, extraInfo = _req$body4.extraInfo, date = _req$body4.date, time = _req$body4.time, maxParticipants = _req$body4.maxParticipants, price = _req$body4.price;
          jwt.verify(token, jwtSecret, {}, function _callee9(err, userData) {
            var placeDoc;
            return regeneratorRuntime.async(function _callee9$(_context9) {
              while (1) {
                switch (_context9.prev = _context9.next) {
                  case 0:
                    if (!err) {
                      _context9.next = 2;
                      break;
                    }

                    throw err;

                  case 2:
                    _context9.next = 4;
                    return regeneratorRuntime.awrap(Place.findById(id));

                  case 4:
                    placeDoc = _context9.sent;

                    if (!(userData.id === placeDoc.owner.toString())) {
                      _context9.next = 10;
                      break;
                    }

                    placeDoc.set({
                      title: title,
                      address: address,
                      photos: addedPhotos,
                      description: description,
                      extraInfo: extraInfo,
                      date: date,
                      time: time,
                      maxParticipants: maxParticipants,
                      price: price
                    });
                    _context9.next = 9;
                    return regeneratorRuntime.awrap(placeDoc.save());

                  case 9:
                    res.json('ok');

                  case 10:
                  case "end":
                    return _context9.stop();
                }
              }
            });
          });

        case 3:
        case "end":
          return _context10.stop();
      }
    }
  });
});
app["delete"]('/places/:id', function _callee11(req, res) {
  var id;
  return regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          id = req.params.id;
          _context11.prev = 1;
          _context11.next = 4;
          return regeneratorRuntime.awrap(Place.findByIdAndDelete(id));

        case 4:
          res.json('event deleted successfully');
          _context11.next = 11;
          break;

        case 7:
          _context11.prev = 7;
          _context11.t0 = _context11["catch"](1);
          console.error('Error deleting place:', _context11.t0);
          res.status(500).send('Internal Server Error');

        case 11:
        case "end":
          return _context11.stop();
      }
    }
  }, null, null, [[1, 7]]);
});
app.get('/places', function _callee12(req, res) {
  return regeneratorRuntime.async(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          _context12.t0 = res;
          _context12.next = 3;
          return regeneratorRuntime.awrap(Place.find());

        case 3:
          _context12.t1 = _context12.sent;

          _context12.t0.json.call(_context12.t0, _context12.t1);

        case 5:
        case "end":
          return _context12.stop();
      }
    }
  });
});
app.post('/bookings', function _callee14(req, res) {
  var token;
  return regeneratorRuntime.async(function _callee14$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          try {
            token = req.cookies.token;
            jwt.verify(token, jwtSecret, function _callee13(err, decoded) {
              var userData, _req$body5, place, numberOfParticipants, name, phone, price, options, razorpayOrder, newBooking, savedBooking;

              return regeneratorRuntime.async(function _callee13$(_context13) {
                while (1) {
                  switch (_context13.prev = _context13.next) {
                    case 0:
                      if (!err) {
                        _context13.next = 4;
                        break;
                      }

                      return _context13.abrupt("return", res.status(401).json({
                        message: 'Unauthorized'
                      }));

                    case 4:
                      userData = decoded;
                      _req$body5 = req.body, place = _req$body5.place, numberOfParticipants = _req$body5.numberOfParticipants, name = _req$body5.name, phone = _req$body5.phone, price = _req$body5.price;
                      options = {
                        amount: price * 100,
                        // Convert to paise
                        currency: 'INR',
                        receipt: shortid.generate(),
                        payment_capture: 1
                      };
                      _context13.prev = 7;
                      _context13.next = 10;
                      return regeneratorRuntime.awrap(razorpay.orders.create(options));

                    case 10:
                      razorpayOrder = _context13.sent;
                      newBooking = new Booking({
                        place: place,
                        user: userData.id,
                        numberOfParticipants: numberOfParticipants,
                        name: name,
                        phone: phone,
                        price: price,
                        razorpayOrderId: razorpayOrder.id
                      });
                      _context13.next = 14;
                      return regeneratorRuntime.awrap(newBooking.save());

                    case 14:
                      savedBooking = _context13.sent;
                      res.json(savedBooking);
                      _context13.next = 22;
                      break;

                    case 18:
                      _context13.prev = 18;
                      _context13.t0 = _context13["catch"](7);
                      console.error('Error creating Razorpay order:', _context13.t0);
                      res.status(500).send('Internal Server Error');

                    case 22:
                    case "end":
                      return _context13.stop();
                  }
                }
              }, null, null, [[7, 18]]);
            });
          } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
          }

        case 1:
        case "end":
          return _context14.stop();
      }
    }
  });
});
app.get('/bookings', function _callee15(req, res) {
  var userData;
  return regeneratorRuntime.async(function _callee15$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          _context15.next = 2;
          return regeneratorRuntime.awrap(getUserDataFromReq(req));

        case 2:
          userData = _context15.sent;
          _context15.t0 = res;
          _context15.next = 6;
          return regeneratorRuntime.awrap(Booking.find({
            user: userData.id
          }).populate('place'));

        case 6:
          _context15.t1 = _context15.sent;

          _context15.t0.json.call(_context15.t0, _context15.t1);

        case 8:
        case "end":
          return _context15.stop();
      }
    }
  });
});
app.listen(4000);
//# sourceMappingURL=index.dev.js.map
