// Debug endpoint to see all orders
app.get('/api/debug/orders', (req, res) => {
    console.log('Current orders in memory:', memoryData.orders);
    res.json({
        ordersCount: memoryData.orders.length,
        orders: memoryData.orders
    });
});