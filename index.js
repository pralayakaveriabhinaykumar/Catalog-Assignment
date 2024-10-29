const express = require("express");
const bodyParser = require("body-parser");
const bigInt = require("big-integer");
const morgan = require("morgan");
const fs = require("fs"); // Require the fs module

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(morgan("dev"));

// Function to decode a number from a given base
function decodeValue(base, value) {
    return value.split('').reverse().reduce((acc, digit, index) => {
        return acc.add(bigInt(digit, 10).multiply(bigInt(base).pow(index)));
    }, bigInt(0));
}

// Lagrange interpolation to find the constant term of the polynomial
function lagrangeInterpolation(points) {
    const k = points.length;
    let c = bigInt(0);

    for (let i = 0; i < k; i++) {
        let x_i = points[i][0];
        let y_i = points[i][1];

        let L_i = bigInt(1);
        for (let j = 0; j < k; j++) {
            if (i !== j) {
                L_i = L_i.multiply(bigInt(0).subtract(bigInt(points[j][0]))).divide(bigInt(x_i).subtract(bigInt(points[j][0])));
            }
        }
        c = c.add(L_i.multiply(y_i));
    }
    return c;
}

// API endpoint to calculate the constant term of the polynomial
app.post("/calculateSecretCode", (req, res) => {
    try {
        // Read the JSON files
        const testCase1 = JSON.parse(fs.readFileSync('test1.json', 'utf8'));
        const testCase2 = JSON.parse(fs.readFileSync('test2.json', 'utf8'));

        // Here you can choose which test case to use
        const inputData = testCase1; // or testCase2 based on your needs

        const { keys, ...roots } = inputData; // Destructure input

        const n = keys.n;
        const k = keys.k;

        const points = [];
        for (const key in roots) {
            const { base, value } = roots[key];
            const x = parseInt(key);
            const y = decodeValue(parseInt(base), value);
            points.push([x, y]);
        }

        const secret = lagrangeInterpolation(points.slice(0, k));

        res.status(200).json({ constantTerm: Math.abs(secret).toString() });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get("/", (req, res) => {
    res.status(200).send("Hello World");
});

// Start the server
app.listen(PORT, () => {
    console.log(Server is running on http://localhost:${PORT});
});
