const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'bekrin',
  password: '3741',
  database: 'opencart'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database', err);
    return;
  }
  console.log('Connected to database');
});

// Route to fetch total orders
app.get('/api/total-orders', (req, res) => {
  db.query('SELECT COUNT(*) AS totalOrders FROM oc_order WHERE order_status_id > 0', (err, results) => {
    if (err) {
      console.error('Error executing query', err);
      res.status(500).send('Error fetching total orders');
      return;
    }
    res.json(results[0]);
  });
});


app.get('/api/latest-orders', (req, res) => {
  const query = `
    SELECT order_id, CONCAT(firstname, ' ', lastname) AS customer, order_status_id AS status, date_added, total
    FROM oc_order
    ORDER BY date_added DESC
    LIMIT 5;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query', err);
      res.status(500).send('Error fetching latest orders');
      return;
    }
    res.json(results);
  });
});


// Route to fetch total sales
app.get('/api/total-sales', (req, res) => {
  db.query('SELECT SUM(total) AS total_sales FROM oc_order;', (err, results) => {
    if (err) {
      console.error('Error executing query', err);
      res.status(500).send('Error fetching total orders');
      return;
    }
    res.json(results[0]);
  });
});


//// Route to fetch total  customers;
app.get('/api/total-customers', (req, res) => {
  db.query('SELECT COUNT(*) AS total_customers FROM oc_customer;', (err, results) => {
    if (err) {
      console.error('Error executing query', err);
      res.status(500).send('Error fetching total orders');
      return;
    }
    res.json(results[0]);
  });
});


app.get('/api/total-products', (req, res) => {
  db.query('SELECT COUNT(*) AS total FROM `oc_product`;', (err, results) => {
    if (err) {
      console.error('Error executing query', err);
      res.status(500).send('Error fetching total orders');
      return;
    }
    res.json(results[0]);
  });
});




// Route to fetch total  category;
app.get('/api/total-category', (req, res) => {
  db.query('SELECT COUNT(*) AS total_categories FROM oc_category;', (err, results) => {
    if (err) {
      console.error('Error executing query', err);
      res.status(500).send('Error fetching total orders');
      return;
    }
    res.json(results[0]);
  });
});




// Endpoint for customer registrations
app.get('/api/customer-registrations', (req, res) => {
  const query = `
   SELECT DATE(date_added) AS date, COUNT(*) AS count
FROM oc_customer
GROUP BY DATE(date_added)
ORDER BY DATE(date_added);

  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query', err);
      res.status(500).send('Error fetching customer registrations');
      return;
    }
    res.json(results);
  });
});

// Endpoint for order placements
app.get('/api/order-placements', (req, res) => {
  const query = `
   SELECT DATE(date_added) AS date, COUNT(*) AS count
FROM oc_order
WHERE order_status_id > 0
GROUP BY DATE(date_added)
ORDER BY DATE(date_added);

  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query', err);
      res.status(500).send('Error fetching order placements');
      return;
    }
    res.json(results);
  });
});



// Endpoint for Top-products
app.get('/api/top-products', (req, res) => {
  const query = `
 SELECT  pd.name, SUM(op.quantity) AS total_sales FROM oc_order_product op JOIN oc_product p ON op.product_id = p.product_id JOIN
 oc_product_description pd ON p.product_id = pd.product_id GROUP BY op.product_id, pd.name ORDER BY total_sales DESC LIMIT 5;

  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query', err);
      res.status(500).send('Error fetching order placements');
      return;
    }
    res.json(results);
  });
});

// Endpoint for Stock status
app.get('/api/stock-status', (req, res) => {
  const query = `SELECT 
    stock_status,
    COUNT(product_id) AS status_count,
    (COUNT(product_id) / (SELECT COUNT(*) FROM oc_product)) * 100 AS percentage
FROM (
    SELECT 
        product_id,
        CASE 
            WHEN quantity = 0 THEN 'Out of Stock'
            WHEN quantity BETWEEN 1 AND 5 THEN 'Low Stock'
            ELSE 'In Stock'
        END AS stock_status
    FROM oc_product
) AS stock_status_distribution
GROUP BY stock_status;

  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query', err);
      res.status(500).send('Error fetching order placements');
      return;
    }
    res.json(results);
  });
});


const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
