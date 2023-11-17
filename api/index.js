const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User.js');
const Place = require('./models/Place.js');
const Booking = require('./models/Booking.js')
const cookieParser = require('cookie-parser');
const Razorpay = require('razorpay');
const shortid = require('shortid');
const bodyParser = require('body-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');

require('dotenv').config();
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'fasefraw4r5r3wq45wdfgw34twdfg';

const razorpay = new Razorpay({
    key_id: 'rzp_test_4AAfE1spa0SuuG',
    key_secret: 'LmVk3BAP6wDjj4Ls9Jw7onuU'
});

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(__dirname+'/uploads'));
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
}));

mongoose.connect(process.env.MONGO_URL);
  
function getUserDataFromReq(req) {
    return new Promise((resolve, reject) => {
        jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            resolve(userData);
        });
    });
}

app.get('/test', (req, res) => {
    res.json('test ok');
});

app.post('/register', async (req,res) => {
    const {name,email,password} = req.body;

    try {
        const userDoc = await User.create({
            name,
            email,
            password:bcrypt.hashSync(password, bcryptSalt),
        });
        res.json(userDoc);
    }
    catch (e) {
        res.status(422).json(e);
    }
});

app.post('/login', async (req,res) => {
    const {email, password} = req.body;
    const userDoc = await User.findOne({email});
    if (userDoc) {
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (passOk) {
            jwt.sign({
                email:userDoc.email, 
                id:userDoc._id
            }, jwtSecret, {}, (err,token) => {
                if (err) throw err;
                res.cookie('token', token).json(userDoc);
            });
        }
        else{
            res.status(422).json('pass not ok')
        }
    }
    else {
        res.json('not found');
    }
});

app.get('/profile', (req,res) => {
    const {token} = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            const {name,email,_id} = await User.findById(userData.id);
            res.json({name,email,_id});
        });
    } else {
        res.json(null);
    }
});

app.post('/logout', (req,res) => {
    res.cookie('token', '').json(true);
}); 

console.log({__dirname})
app.post('/upload-by-link', async (req,res) => {
    const {link} = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    await imageDownloader.image({
        url: link,
        dest: __dirname + '/uploads/' +newName,
    });
    res.json(newName);
});

const photosMiddleware = multer({dest:'uploads'});
app.post('/upload', photosMiddleware.array('photos', 100), (req,res) => {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
        const {path,originalname} = req.files[i];
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        const newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
        uploadedFiles.push(newPath.replace('uploads',''));
    }
    res.json(uploadedFiles);
});

app.post('/places', (req,res) => {
    const {token} = req.cookies;
    const {
        title,address,addedPhotos,description,price,
        extraInfo,date,time,maxParticipants,
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const placeDoc = await Place.create({
            owner:userData.id,price,
            title,address,photos:addedPhotos,description,
            extraInfo,date,time,maxParticipants,
        });
        res.json(placeDoc);
    });
});

app.get('/user-places', (req,res) => {
    const {token} = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        const {id} = userData;
        res.json( await Place.find({owner:id}) );
    });
});

app.get('/places/:id', async (req,res) => {
    const {id} = req.params;
    res.json(await Place.findById(id));
});

app.put('/places', async (req,res) => {
    const {token} = req.cookies;
    const {
        id, title,address,addedPhotos,description,
        extraInfo,date,time,maxParticipants,price,
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const placeDoc = await Place.findById(id);
        if (userData.id === placeDoc.owner.toString()) {
            placeDoc.set({
                title,address,photos:addedPhotos,description,
                extraInfo,date,time,maxParticipants,price,
            });
            await placeDoc.save();
            res.json('ok');
        }
    });
});

app.delete('/places/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Place.findByIdAndDelete(id);
        res.json('event deleted successfully');
    } catch (error) {
        console.error('Error deleting place:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/places', async (req,res) => {
    res.json( await Place.find() );
});

app.post('/bookings', async (req, res) => {
    try {
        const {token} = req.cookies;

        jwt.verify(token, jwtSecret, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Unauthorized' });
            } else {
                const userData = decoded;

                const { place, numberOfParticipants, name, phone, price } = req.body;

                const options = {
                    amount: (price * 100), // Convert to paise
                    currency: 'INR',
                    receipt: shortid.generate(),
                    payment_capture: 1
                };

                try {
                    const razorpayOrder = await razorpay.orders.create(options);
    
                    const newBooking = new Booking({
                        place,
                        user: userData.id,
                        numberOfParticipants,
                        name,
                        phone,
                        price,
                        razorpayOrderId: razorpayOrder.id,
                    });
    
                    const savedBooking = await newBooking.save();
                    res.json(savedBooking);
                } catch (error) {
                    console.error('Error creating Razorpay order:', error);
                    res.status(500).send('Internal Server Error');
                }
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/bookings', async (req,res) => {
    const userData = await getUserDataFromReq(req);
    res.json ( await Booking.find({user:userData.id}).populate('place') );
});

app.listen(4000);