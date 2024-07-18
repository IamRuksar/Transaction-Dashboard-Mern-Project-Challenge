// client/src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import data from "./data.json"
import style from "./module.bar.css"
// import server from "./server.js"

function App() {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [transactions, setTransactions] = useState(data);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(6);
    const [search, setSearch] = useState('');
    const [statistics, setStatistics] = useState({ data });
    const [barChartData, setBarChartData] = useState(data);
    const [pieChartData, setPieChartData] = useState(data);

    useEffect(() => {
        fetchTransactions();
    }, [month, currentPage, search]);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get('/api/transactions', {
                params: {
                    month,
                    page: currentPage,
                    perPage,
                    search,
                },
            });
            setTransactions(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, [month]);

    const fetchStatistics = async () => {
        try {
            const response = await axios.get('/api/statistics', {
                params: {
                    month,
                },
            });
            setStatistics(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchBarChart();
    }, [month]);

    const fetchBarChart = async () => {
        try {
            const response = await axios.get('/api/bar-chart', {
                params: {
                    month,
                },
            });
            setBarChartData(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchPieChart();
    }, [month]);

    const fetchPieChart = async () => {
        try {
            const response = await axios.get('/api/pie-chart', {
                params: {
                    month,
                },
            });
            setPieChartData(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleMonthChange = (event) => {
        setMonth(parseInt(event.target.value));
    };

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    //  bar data
    const dataBar = [
        { label: '0-100', value: 10 },
        { label: '101-200', value: 15 },
        { label: '201-300', value: 30 },
        { label: '301-400', value: 20 },
        { label: '401-500', value: 60 },
        { label: '501-600', value: 25 },
        { label: '601-700', value: 35 },
        { label: '701-800', value: 80 },
        { label: '801-900', value: 18 },
        { label: '901 above', value: 38 },
    ];



    // Function to generate bar chart
    const generateBarChart = () => {
        if (barChartData.length === 0) {
            return null;
        }

        return (
            <div>
                <h2>Bar Chart</h2>
                <svg width={694} height={480} style={{ border: "1px solid black" }}>
                    {barChartData.map((item) => (
                        <rect
                            key={item.price}
                            x={
                                (item.id * 60) +
                                (item.id * 20)
                            }
                            y={400 - item.id * 50}
                            width={60}
                            height={item.id * 50}
                            fill="skyblue"
                        />
                    ))}
                    {barChartData.map((item, index) => (
                        <text
                            key={item.id}
                            x={
                                (item.id * 60) +
                                (item.id * 20) +
                                60 / 2 -
                                item.id * 2.5
                            }
                            y={400 + 15}
                            textAnchor="middle"
                            fill="black"
                            fontSize="15"
                        >
                            {Math.round(item.id * 100)}-{Math.round(item.id * 200)}
                        </text>
                    ))}
                    <text
                        x={300}
                        y={400 + 40}
                        textAnchor="middle"
                        fontSize="16"
                        fill='black'
                    >
                        Price Range
                    </text>
                    <text
                        x={0}
                        y={20}
                        textAnchor="start"
                        // transform="rotate(-90 0 20)"
                        fontSize="16"
                        fill="black"
                    >
                        Number of Items
                    </text>
                </svg>
            </div>
        );
    };

    // Function to generate pie chart
    const generatePieChart = () => {
        if (pieChartData.length === 0) {
            return null;
        }

        const totalItems = pieChartData.reduce(
            (sum, item) => sum + item.count,
            0
        );

        const pieChartItems = pieChartData.map((item) => ({
            ...item,
            percentage: ((item.count / totalItems) * 100).toFixed(2),
        }));
        

        return (
            <div>
                <h2>Pie Chart</h2>
                <svg width={400} height={400}>
                    {pieChartItems.map((item, index) => {
                        const startAngle =
                            (index / pieChartItems.length) * Math.PI * 2;
                        const endAngle =
                            ((index + 1) / pieChartItems.length) * Math.PI * 2;

                        const x = 200 + 150 * Math.cos((startAngle + endAngle) / 2);
                        const y = 200 + 150 * Math.sin((startAngle + endAngle) / 2);

                        return (
                            <path
                                key={index}
                                d={`M 200 200
                A 150 150 0 0 1 ${200 + 150 * Math.cos(endAngle)
                                    } ${200 + 150 * Math.sin(endAngle)}
                L 200 200`}
                                fill={
                                    index === 0
                                        ? 'skyblue'
                                        : index === 1
                                            ? 'lightgreen'
                                            : 'pink'
                                }
                                stroke="white"
                                strokeWidth={1}
                            />
                        );
                    })}
                    {pieChartItems.map((item, index) => {
                        const startAngle =
                            (index / pieChartItems.length) * Math.PI * 2;
                        const endAngle =
                            ((index + 1) / pieChartItems.length) * Math.PI * 2;

                        const x = 200 + 150 * Math.cos((startAngle + endAngle) / 2);
                        const y = 200 + 150 * Math.sin((startAngle + endAngle) / 2);


                        return (
                            <text
                                key={index}
                                x={x}
                                y={y}
                                textAnchor="middle"
                                fill="black"
                                fontSize="10"
                                style={{ marginLeft: "200px" }}
                            >
                                {item.id}: {Math.round(item.price) - 10}-{Math.round(item.price) + 10}
                            </text>
                        );
                    })}
                </svg>
            </div>
        );
    };

    return (
        <div className="App">
            <h1>MERN Stack Coding Challenge</h1>
            <div style={{height:'180px',width:'180px',borderRadius:'100px',background:'white',color:'grey',marginLeft:'650px',marginBottom:'20px'}}>
                <h2 style={{paddingTop:'70px'}}>Transactions Dashboard</h2></div>
            
            <div>
                <select value={month} onChange={handleMonthChange} style={{marginRight:'700px',height:'40px',width:'100px',background:'#ffcc00',borderRadius:'20px',fontSize:'15px',paddingLeft:'10px'}}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <option key={month} value={month}>
                            {new Date(0, month - 1).toLocaleString('default', {
                                month: 'long',
                            })}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Search transactions"
                    value={search}
                    onChange={handleSearchChange}
                    style={{marginRight:'20px',height:'40px',width:'150px',background:'#fadb75',borderRadius:'40px',fontSize:'15px',paddingLeft:'10px'}}
                />
            </div>
            <table className="transactions-table" style={{borderRadius:"20px"}}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Sold</th>
                        <th>Image</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                            <td>{transaction.id}</td>
                            <td>{transaction.title}</td>
                            <td>{transaction.description}</td>
                            <td>{transaction.price}</td>
                            <td>{transaction.category}</td>
                            <td>{transaction.sold ? 'Yes' : 'No'}</td>
                            <td>
                                <img
                                    src={transaction.image}
                                    alt={transaction.title}
                                    width="50"
                                    height="50"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === Math.ceil(transactions.length / perPage)}
                >
                    Next
                </button>
                <span>
                    Page {currentPage} of{' '}
                    {Math.ceil(transactions.length / perPage)}
                </span>
            </div>
            <h2>Transactions Statistics</h2>
            <div className="statistics">
                <h3>
                    Statistics -{' '}
                    {new Date(0, month - 1).toLocaleString('default', {
                        month: 'long',
                    })}
                </h3>
                <p>Total Sale: {data.length}</p>
                <p>Total Sold Items: {new Set(data.filter((item) => item.sold == true)).size}</p>
                <p>Total Not Sold Items: {new Set(data.filter((item) => item.sold == false)).size}</p>
            </div>
            <div className="chart-container">
                <h2>Bar Chart Stats -{' '}
                    {new Date(0, month - 1).toLocaleString('default', {
                        month: 'long',
                    })} </h2>
                <div className="chart">
                    {dataBar.map((item, index) => (
                        <div key={index} className="bar">
                            <div className="bar-fill" style={{ height: `${item.value}%` }} />
                            <span className="bar-label">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            {/* {generateBarChart()} */}
            {generatePieChart()}
        </div>
    );
}

export default App;