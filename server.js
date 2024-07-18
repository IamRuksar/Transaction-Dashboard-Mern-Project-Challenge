// server.js
// import data from "./data.json"
// import App from "./App"
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/mern-stack-challenge', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

// Product Transaction Schema
const ProductTransactionSchema = new mongoose.Schema({
    id: Number,
    title: String,
    description: String,
    price: Number,
    category: String,
    dateOfSale: Date,
    sold: Boolean,
    image: String,
});

const ProductTransaction = mongoose.model(
    'ProductTransaction',
    ProductTransactionSchema
);

// Seed Database with Data from Third-Party API
app.get('/api/initialize', async (req, res) => {
    try {
        const response = await axios.get(
            'https://s3.amazonaws.com/roxiler.com/product_transaction.json'
        );
        const data = response.data;

        // Insert data into MongoDB
        await ProductTransaction.insertMany(data);

        res.json({ message: 'Database initialized successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to initialize database' });
    }
});

// Get all transactions
app.get('/api/transactions', async (req, res) => {
    try {
        const { month, page, perPage, search } = req.query;
        const selectedMonth = parseInt(month);

        // Search query
        let query = {
            dateOfSale: {
                $gte: new Date(new Date().getFullYear(), selectedMonth - 1, 1),
                $lt: new Date(new Date().getFullYear(), selectedMonth, 1),
            },
        };

        if (search) {
            query = {
                ...query,
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { price: { $regex: search, $options: 'i' } },
                ],
            };
        }

        const options = {
            page: parseInt(page) || 1,
            limit: parseInt(perPage) || 10,
        };

        const transactions = await ProductTransaction.paginate(query, options);
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Get statistics for selected month
app.get('/api/statistics', async (req, res) => {
    try {
        const { month } = req.query;
        const selectedMonth = parseInt(month);

        const query = {
            dateOfSale: {
                $gte: new Date(new Date().getFullYear(), selectedMonth - 1, 1),
                $lt: new Date(new Date().getFullYear(), selectedMonth, 1),
            },
        };

        const totalSale = await ProductTransaction.aggregate([
            {
                $match: query,
            },
            {
                $group: {
                    _id: null,
                    totalSale: { $sum: '$price' },
                },
            },
        ]);

        const totalSoldItems = await ProductTransaction.countDocuments({
            ...query,
            sold: true,
        });

        const totalNotSoldItems = await ProductTransaction.countDocuments({
            ...query,
            sold: false,
        });

//         // Create a new database
// // use mern - stack - challenge

//         // Create a new collection
//         db.createCollection("product_transactions")

//         // Insert data into the collection
//         db.product_transactions.insertMany([
//             {
//                 id: 1,
//                 title: "Product 1",
//                 description: "This is product 1",
//                 price: 100,
//                 category: "Electronics",
//                 dateOfSale: ISODate("2022-01-01T00:00:00.000Z"),
//                 sold: true,
//                 image: "https://example.com/product1.jpg"
//             },
//             {
//                 id: 2,
//                 title: "Product 2",
//                 description: "This is product 2",
//                 price: 200,
//                 category: "Electronics",
//                 dateOfSale: ISODate("2022-01-05T00:00:00.000Z"),
//                 sold: false,
//                 image: "https://example.com/product2.jpg"
//             },
//             // Add more products here
//         ])

//         // Create an index on the dateOfSale field
//         db.product_transactions.createIndex({ dateOfSale: 1 })

//         // Create an index on the category field
//         db.product_transactions.createIndex({ category: 1 })

        res.json({
            totalSale: totalSale.length > 0 ? totalSale[0].totalSale : 0,
            totalSoldItems,
            totalNotSoldItems,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Get bar chart data for selected month
app.get('/api/bar-chart', async (req, res) => {
    try {
        const { month } = req.query;
        const selectedMonth = parseInt(month);

        const query = {
            dateOfSale: {
                $gte: new Date(new Date().getFullYear(), selectedMonth - 1, 1),
                $lt: new Date(new Date().getFullYear(), selectedMonth, 1),
            },
        };

        const barChartData = await ProductTransaction.aggregate([
            {
                $match: query,
            },
            {
                $group: {
                    _id: {
                        priceRange: {
                            $cond: {
                                if: { $lte: ['$price', 100] },
                                then: '0-100',
                                else: {
                                    $cond: {
                                        if: { $lte: ['$price', 200] },
                                        then: '101-200',
                                        else: {
                                            $cond: {
                                                if: { $lte: ['$price', 300] },
                                                then: '201-300',
                                                else: {
                                                    $cond: {
                                                        if: { $lte: ['$price', 400] },
                                                        then: '301-400',
                                                        else: {
                                                            $cond: {
                                                                if: { $lte: ['$price', 500] },
                                                                then: '401-500',
                                                                else: {
                                                                    $cond: {
                                                                        if: { $lte: ['$price', 600] },
                                                                        then: '501-600',
                                                                        else: {
                                                                            $cond: {
                                                                                if: { $lte: ['$price', 700] },
                                                                                then: '601-700',
                                                                                else: {
                                                                                    $cond: {
                                                                                        if: { $lte: ['$price', 800] },
                                                                                        then: '701-800',
                                                                                        else: {
                                                                                            $cond: {
                                                                                                if: {
                                                                                                    $lte: ['$price', 900],
                                                                                                },
                                                                                                then: '801-900',
                                                                                                else: '901-above',
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    '_id.priceRange': 1,
                },
            },
        ]);

        res.json(barChartData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch bar chart data' });
    }
});

// Get pie chart data for selected month
app.get('/api/pie-chart', async (req, res) => {
    try {
        const { month } = req.query;
        const selectedMonth = parseInt(month);

        const query = {
            dateOfSale: {
                $gte: new Date(new Date().getFullYear(), selectedMonth - 1, 1),
                $lt: new Date(new Date().getFullYear(), selectedMonth, 1),
            },
        };

        const pieChartData = await ProductTransaction.aggregate([
            {
                $match: query,
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                },
            },
        ]);

        res.json(pieChartData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch pie chart data' });
    }
});

// Get combined data from all APIs
app.get('/api/combined-data', async (req, res) => {
    try {
        const { month } = req.query;
        const selectedMonth = parseInt(month);

        const [
            transactionsData,
            statisticsData,
            barChartData,
            pieChartData,
        ] = await Promise.all([
            ProductTransaction.paginate(
                {
                    dateOfSale: {
                        $gte: new Date(
                            new Date().getFullYear(),
                            selectedMonth - 1,
                            1
                        ),
                        $lt: new Date(
                            new Date().getFullYear(),
                            selectedMonth,
                            1
                        ),
                    },
                },
                {
                    page: 1,
                    limit: 10,
                }
            ),
            ProductTransaction.aggregate([
                {
                    $match: {
                        dateOfSale: {
                            $gte: new Date(
                                new Date().getFullYear(),
                                selectedMonth - 1,
                                1
                            ),
                            $lt: new Date(
                                new Date().getFullYear(),
                                selectedMonth,
                                1
                            ),
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalSale: { $sum: '$price' },
                        totalSoldItems: { $sum: { $cond: ['$sold', 1, 0] } },
                        totalNotSoldItems: { $sum: { $cond: ['$sold', 0, 1] } },
                    },
                },
            ]),
            ProductTransaction.aggregate([
                {
                    $match: {
                        dateOfSale: {
                            $gte: new Date(
                                new Date().getFullYear(),
                                selectedMonth - 1,
                                1
                            ),
                            $lt: new Date(
                                new Date().getFullYear(),
                                selectedMonth,
                                1
                            ),
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            priceRange: {
                                $cond: {
                                    if: { $lte: ['$price', 100] },
                                    then: '0-100',
                                    else: {
                                        $cond: {
                                            if: { $lte: ['$price', 200] },
                                            then: '101-200',
                                            else: {
                                                $cond: {
                                                    if: { $lte: ['$price', 300] },
                                                    then: '201-300',
                                                    else: {
                                                        $cond: {
                                                            if: { $lte: ['$price', 400] },
                                                            then: '301-400',
                                                            else: {
                                                                $cond: {
                                                                    if: { $lte: ['$price', 500] },
                                                                    then: '401-500',
                                                                    else: {
                                                                        $cond: {
                                                                            if: { $lte: ['$price', 600] },
                                                                            then: '501-600',
                                                                            else: {
                                                                                $cond: {
                                                                                    if: { $lte: ['$price', 700] },
                                                                                    then: '601-700',
                                                                                    else: {
                                                                                        $cond: {
                                                                                            if: { $lte: ['$price', 800] },
                                                                                            then: '701-800',
                                                                                            else: {
                                                                                                $cond: {
                                                                                                    if: {
                                                                                                        $lte: ['$price', 900],
                                                                                                    },
                                                                                                    then: '801-900',
                                                                                                    else: '901-above',
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: {
                        '_id.priceRange': 1,
                    },
                },
            ]),
            ProductTransaction.aggregate([
                {
                    $match: {
                        dateOfSale: {
                            $gte: new Date(
                                new Date().getFullYear(),
                                selectedMonth - 1,
                                1
                            ),
                            $lt: new Date(
                                new Date().getFullYear(),
                                selectedMonth,
                                1
                            ),
                        },
                    },
                },
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 },
                    },
                },
            ]),
        ]);

        res.json({
            transactionsData,
            statisticsData: statisticsData.length > 0 ? statisticsData[0] : {},
            barChartData,
            pieChartData,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch combined data' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});