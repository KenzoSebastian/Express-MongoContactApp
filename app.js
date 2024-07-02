const express = require("express");
const expressLayouts = require("express-ejs-layouts");

const { body, validationResult, check } = require("express-validator");
const methodOverride = require("method-override");

const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

require("./utils/db");
const Contact = require("./model/contact");

const app = express();
const port = 3000;

// Setup Method Override
app.use(methodOverride("_method"));

// Setup EJS
app.set("view engine", "ejs");
app.use(expressLayouts); 
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// konfigurasi flash
app.use(cookieParser("secret"));
app.use(session({
        cookie: { maxAge: 6000 },
        secret: "secret",
        resave: true,
        saveUninitialized: true,
    }));
app.use(flash());

// Halaman Home
app.get("/", (req, res) => {
    const mahasiswa = [
        {
            nama: "Kenzo sebastian",
            email: "kenzo@gmail.com",
            NIM: 17220901,
        },
        {
            nama: "Budi Anugerah",
            email: "budiAnugrah@gmail.com",
            NIM: 17220991,
        },
        {
            nama: "Kevin Damaris",
            email: "KeVinDmris@gmail.com",
            NIM: 17220935,
        },
    ]

    res.render("index", {
        nama: "Tessa",
        title: "Home",
        mahasiswa,
        layout: "layouts/mainLayout",
    });
});

// Halaman About
app.get("/about", (req, res) => {
    res.render("about", {
        title: "Halaman About",
        layout: "layouts/mainLayout",
    });
});

// Halaman Contact
app.get("/contact", async (req, res) => {
    // const contacts = contact.find().then(result => res.send(result));

    const contacts = await Contact.find();
    res.render("contact", {
        title: "Halaman Contact",
        layout: "layouts/mainLayout",
        contacts,
        msg: req.flash("msg"),
    });
});

// halaman form tambah data contact
app.get("/contact/add", (req, res) => {
    res.render("add-contact", {
        title: "Form Tambah Data Contact",
        layout: "layouts/mainLayout",
    })
});

const validationArray = [
    body("nama").custom(async value => {
        const duplikat = await Contact.findOne({ nama: value });
        if (duplikat) {
            throw new Error("Nama contact sudah digunakan!");
        };
        return true;
    }),
    check("email", "Email tidak valid").isEmail(),
    check("nohp", "No Hp tidak valid").isMobilePhone("id-ID")
];

// proses data contact
app.post("/contact", validationArray, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render(("add-contact"), {
            title: "Form Tambah Data Contact",
            layout: "layouts/mainLayout",
            errors: errors.array(), 
        });
    } else {
        Contact.insertMany(req.body, () => {
            // kirimkan flash message
            req.flash("msg", "Data Contact berhasil ditambahkan!");
            res.redirect("/contact");
        });
    };
});

// proses delete contact
// app.get("/contact/delete/:nama", async (req, res) => {
//     const contact = await Contact.findOne({ nama: req.params.nama });

//     // jika Contact tidak ada
//     if (!contact) {
//         res.status(404).send("<h1>404 NOT FOUND</h1>");
//     } else {
//         await Contact.deleteOne({ _id: contact._id }, () => {
//             req.flash("msg", "Data contact berhasil dihapus!");
//             res.redirect("/contact");
//         });
//     };
// });

app.delete("/contact", async (req, res) => {
        await Contact.deleteOne({ nama: req.body.nama }, () => {
            req.flash("msg", "Data contact berhasil dihapus!");
            res.redirect("/contact");
        });
});

// halaman detail contact
app.get("/contact/:nama", async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama });
    res.render("detail", {
        title: "Halaman Detail Contact",
        layout: "layouts/mainLayout",
        contact,
    });
});

// halaman form ubah data contact
app.get("/contact/edit/:nama", async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama });

    res.render("edit-contact", {
        title: "Form Ubah Data Contact",
        layout: "layouts/mainLayout",
        contact,
    });
});

const validationUpdateData = [
    body("nama").custom(async (value, { req }) => {
        const duplikat = await Contact.findOne({ nama: value });
        if (value !== req.body.oldNama && duplikat) {
            throw new Error("Nama contact sudah digunakan!");
        };
        return true;
    }),
    check("email", "Email tidak valid").isEmail(),
    check("nohp", "No Hp tidak valid").isMobilePhone("id-ID")
];

// proses ubah data
app.put("/contact", validationUpdateData, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render(("edit-contact"), {
            title: "Form Ubah Data Contact",
            layout: "layouts/mainLayout",
            errors: errors.array(), 
            contact: req.body,
        });
    } else {
        Contact.updateOne(
            { _id: req.body._id },
            {
                $set: {
                    nama: req.body.nama,
                    email: req.body.email,
                    nohp: req.body.nohp,
                },
            },
        ).then(result => {
            // kirimkan flash message
            req.flash("msg", "Data Contact berhasil diubah!");
            res.redirect("/contact");
        })

    };
});

app.listen(port, () => {
    console.log(`Mongo Contact App || Listening at http://localhost:${port}`);
})