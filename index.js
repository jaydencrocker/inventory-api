const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ====== In-Memory Data (Demo Only) ======
let inventory = [
  { id: 1, name: "Espresso Beans", description: "Dark roast, 2lb bag", stock: 10, price: 15.99, lowStockAlert: false }
];
let orders = [];
let leads = [];

let nextId = 2;

// ====== Root Welcome Route ======
app.get('/', (req, res) => {
  res.send('✅ Welcome to the Smart Inventory & Order Management API');
});

// ====== Inventory Endpoints ======

// Get all inventory items
app.get('/inventory', (req, res) => {
  res.json(inventory);
});

// Add an inventory item
app.post('/inventory', (req, res) => {
  const item = { id: nextId++, lowStockAlert: false, ...req.body };
  if (item.stock <= 5) item.lowStockAlert = true;
  inventory.push(item);
  res.status(201).json(item);
});

// Update an inventory item
app.put('/inventory/:id', (req, res) => {
  const item = inventory.find(i => i.id == req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  Object.assign(item, req.body);
  item.lowStockAlert = item.stock <= 5;
  res.json(item);
});

// Delete an inventory item
app.delete('/inventory/:id', (req, res) => {
  inventory = inventory.filter(i => i.id != req.params.id);
  res.status(204).send();
});

// ====== Order Endpoints ======

app.get('/orders', (req, res) => {
  res.json(orders);
});

app.post('/orders', (req, res) => {
  const { customerName, email, itemsOrdered } = req.body;

  let totalAmount = 0;
  itemsOrdered.forEach(orderItem => {
    const item = inventory.find(i => i.id === orderItem.itemId);
    if (item) {
      totalAmount += item.price * orderItem.quantity;
      item.stock -= orderItem.quantity;
      if (item.stock <= 5) item.lowStockAlert = true;
    }
  });

  const order = {
    id: nextId++,
    customerName,
    email,
    itemsOrdered,
    totalAmount,
    timestamp: new Date().toISOString()
  };

  orders.push(order);
  res.status(201).json(order);
});

// ====== Leads Endpoints ======

app.get('/leads', (req, res) => {
  res.json(leads);
});

app.post('/leads', (req, res) => {
  const lead = { id: nextId++, createdAt: new Date().toISOString(), ...req.body };
  leads.push(lead);
  res.status(201).json(lead);
});

// ====== Dashboard Summary ======

app.get('/dashboard', (req, res) => {
  const lowStockItems = inventory.filter(i => i.lowStockAlert);
  res.json({
    totalInventory: inventory.length,
    totalOrders: orders.length,
    totalLeads: leads.length,
    lowStockCount: lowStockItems.length
  });
});

// ====== 404 Fallback ======

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ====== Start Server ======

app.listen(PORT, () => {
  console.log(`Inventory API running on http://localhost:${PORT}`);
});