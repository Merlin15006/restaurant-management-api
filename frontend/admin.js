
const API = "http://127.0.0.1:8000";

let allOrders = [];

async function loadOrders() {
    const table = document.getElementById("ordersTable");

    try {
        const response = await fetch(`${API}/orders/details`);

        if (!response.ok) {
            throw new Error("Failed to fetch orders");
        }

        allOrders = await response.json();

        document.getElementById("totalOrders").textContent = allOrders.length;

        document.getElementById("placedOrders").textContent =
            allOrders.filter(order => order.status.toLowerCase() === "placed").length;

        document.getElementById("preparingOrders").textContent =
            allOrders.filter(order => order.status.toLowerCase() === "preparing").length;

        document.getElementById("deliveredOrders").textContent =
            allOrders.filter(order => order.status.toLowerCase() === "delivered").length;

        filterOrders();

    } catch (error) {
        console.error(error);
        table.innerHTML = `<tr><td colspan="7">Unable to load orders.</td></tr>`;
    }
}

function filterOrders() {
    const table = document.getElementById("ordersTable");

    const searchText = document.getElementById("searchInput").value.toLowerCase().trim();
    const selectedStatus = document.getElementById("statusFilter").value;

    const filteredOrders = allOrders.filter(order => {
        const matchesSearch =
            order.customer_name.toLowerCase().includes(searchText) ||
            String(order.order_id).includes(searchText);

        const matchesStatus =
            selectedStatus === "all" ||
            order.status.toLowerCase() === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    if (filteredOrders.length === 0) {
        table.innerHTML = `<tr><td colspan="7">No matching orders found.</td></tr>`;
        return;
    }

    table.innerHTML = filteredOrders.map(order => `
        <tr>
            <td>#${order.order_id}</td>
            <td>${order.customer_name}</td>
            <td>${order.item_name}</td>
            <td>${order.quantity}</td>
            <td>₹${Number(order.unit_price).toFixed(2)}</td>
            <td>
                <select id="status-${order.order_id}">
                    <option value="placed" ${order.status.toLowerCase() === "placed" ? "selected" : ""}>Placed</option>
                    <option value="preparing" ${order.status.toLowerCase() === "preparing" ? "selected" : ""}>Preparing</option>
                    <option value="delivered" ${order.status.toLowerCase() === "delivered" ? "selected" : ""}>Delivered</option>
                </select>
                <button onclick="updateStatus(${order.order_id})">Update</button>
            </td>
            <td>${new Date(order.order_date).toLocaleString()}</td>
        </tr>
    `).join("");
}

async function updateStatus(orderId) {
    try {
        const selectedStatus = document.getElementById(`status-${orderId}`).value;

        const getResponse = await fetch(`${API}/orders/${orderId}`);

        if (!getResponse.ok) {
            throw new Error("Unable to retrieve order details");
        }

        const order = await getResponse.json();

        const response = await fetch(`${API}/orders/${orderId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customer_id: order.customer_id,
                menu_item_id: order.menu_item_id,
                quantity: order.quantity,
                unit_price: order.unit_price,
                status: selectedStatus
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Status update failed");
        }

        alert("Order status updated successfully!");

        await loadOrders();

    } catch (error) {
        alert("Update failed: " + error.message);
        console.error(error);
    }
}

loadOrders();
