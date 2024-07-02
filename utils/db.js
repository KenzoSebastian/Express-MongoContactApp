const mongoose = require("mongoose");
mongoose.connect('mongodb://127.0.0.1:27017/wpu', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});



// // menambah 1 data
// const contact1 = new contact({
//     nama: "Tessa Ivanna",
//     nohp: "088266432557",
//     email: "TessaIvanna@gmail.com",
// });

// // simpan ke Collection
// contact1.save().then(contact => console.log(contact));