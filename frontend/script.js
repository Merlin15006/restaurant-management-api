const API = "";
let menu = [];
let categories = [];
let cart = [];
let activeCategory = "All";

const foodImages = {
    burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    pizza: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=800&q=80",
    pasta: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80",
    salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    dessert: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80",
    drink: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80",
    chicken: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80",
    default: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80"
};

function getImage(item) {
    const name = item.name.toLowerCase();

    if (name.includes("burger")) return foodImages.burger;
    if (name.includes("pizza")) return foodImages.pizza;
    if (name.includes("pasta") || name.includes("noodle")) return foodImages.pasta;
    if (name.includes("salad")) return foodImages.salad;
    if (name.includes("cake") || name.includes("dessert") || name.includes("ice cream")) return foodImages.dessert;
    if (name.includes("juice") || name.includes("drink") || name.includes("coffee") || name.includes("tea")) return foodImages.drink;
    if (name.includes("chicken")) return foodImages.chicken;

    return foodImages.default;
}

async function loadMenu() {
    const container = document.getElementById("menu-container");

    try {
        const [menuResponse, categoryResponse] = await Promise.all([
            fetch(`${API}/menu_items/?limit=100`),
            fetch(`${API}/categories/?limit=100`)
        ]);

        if (!menuResponse.ok || !categoryResponse.ok) {
            throw new Error("Failed to load menu");
        }

        menu = await menuResponse.json();
        categories = await categoryResponse.json();

        menu = menu.filter(item => item.is_available !== false);

        renderCategories();
        renderMenu();
    } catch (error) {
        container.innerHTML = `<p>Unable to load menu. Please check that the API is running.</p>`;
        console.error(error);
    }
}

function renderCategories() {
    const container = document.getElementById("categories");
    const names = ["All", ...categories.map(category => category.name)];

    container.innerHTML = names.map(name => `
        <button class="${activeCategory === name ? "active" : ""}"
            onclick="selectCategory(${JSON.stringify(name).replace(/"/g, '&quot;')})">
            ${escapeHTML(name)}
        </button>
    `).join("");
}

function selectCategory(name) {
    activeCategory = name;
    renderCategories();
    renderMenu();
}

function searchMenu() {
    renderMenu();
}

function renderMenu() {
    const container = document.getElementById("menu-container");
    const searchValue = document.getElementById("search").value.toLowerCase();

    const filtered = menu.filter(item => {
        const category = categories.find(c => c.id === item.category_id);
        const categoryName = category ? category.name : "";

        const matchesSearch =
            item.name.toLowerCase().includes(searchValue) ||
            (item.description || "").toLowerCase().includes(searchValue);

        const matchesCategory =
            activeCategory === "All" || categoryName === activeCategory;

        return matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<p>No dishes found.</p>`;
        return;
    }

    container.innerHTML = filtered.map(item => `
        <div class="food-card">
            <img src="${getImage(item)}" alt="${escapeHTML(item.name)}" loading="lazy">
            <div class="food-info">
                <h3>${escapeHTML(item.name)}</h3>
                <p>${escapeHTML(item.description || "Freshly prepared and delicious.")}</p>
                <div class="food-bottom">
                    <span class="price">₹${Number(item.price).toFixed(2)}</span>
                    <button class="add-button" onclick="addToCart(${item.id})">
                        + Add to cart
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[character]));
}

function addToCart(id) {
    const item = menu.find(item => item.id === id);
    if (!item) return;

    const existing = cart.find(cartItem => cartItem.id === id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({...item, quantity: 1});
    }

    renderCart();

    // Open the cart so the user can see the item was added.
    document.getElementById("cart-panel").classList.add("open");
    document.getElementById("overlay").classList.add("show");
}

function changeQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        cart = cart.filter(cartItem => cartItem.id !== id);
    }

    renderCart();
}

function renderCart() {
    const container = document.getElementById("cart-items");
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    document.getElementById("cart-count").textContent = count;
    document.getElementById("cart-total").textContent = total.toFixed(2);

    if (cart.length === 0) {
        container.innerHTML = `<p>Your cart is empty.</p>`;
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div>
                <h4>${escapeHTML(item.name)}</h4>
                <p>₹${Number(item.price).toFixed(2)} × ${item.quantity}</p>
            </div>
            <div>
                <button onclick="changeQuantity(${item.id}, -1)">−</button>
                ${item.quantity}
                <button onclick="changeQuantity(${item.id}, 1)">+</button>
            </div>
        </div>
    `).join("");
}

function toggleCart() {
    document.getElementById("cart-panel").classList.toggle("open");
    document.getElementById("overlay").classList.toggle("show");
}


function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const total = cart.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
    );

    document.getElementById("checkout-total").textContent =
        total.toFixed(2);

    document.getElementById("checkout-modal").classList.add("show");
}

function closeCheckout() {
    document.getElementById("checkout-modal").classList.remove("show");
}

async function submitCheckout(event) {
    event.preventDefault();

    const name = document.getElementById("customer-name").value.trim();
    const email = document.getElementById("customer-email").value.trim();
    const phone = document.getElementById("customer-phone").value.trim();

    const submitButton = document.querySelector(
        "#checkout-form button[type='submit']"
    );

    submitButton.disabled = true;
    submitButton.textContent = "Placing Order...";

    try {
        const customerResponse = await fetch(`${API}/customers/?limit=100`);

        if (!customerResponse.ok) {
            throw new Error("Unable to retrieve customers");
        }

        const customers = await customerResponse.json();

        let customer = customers.find(
            c => c.email.toLowerCase() === email.toLowerCase()
        );

        if (!customer) {
            const response = await fetch(`${API}/customers/`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({name, email, phone})
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Unable to create customer");
            }

            customer = await response.json();
        }

        for (const item of cart) {
            const response = await fetch(`${API}/orders/`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    customer_id: customer.id,
                    menu_item_id: item.id,
                    quantity: item.quantity,
                    unit_price: Number(item.price),
                    status: "Pending"
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Unable to create order");
            }
        }

        alert("Your order has been placed successfully!");

        cart = [];
        renderCart();
        document.getElementById("checkout-form").reset();
        closeCheckout();

        document.getElementById("cart-panel").classList.remove("open");
        document.getElementById("overlay").classList.remove("show");

    } catch (error) {
        alert("Order failed: " + error.message);
        console.error(error);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Confirm Order";
    }
}

document.getElementById("checkout-form").addEventListener(
    "submit",
    submitCheckout
);



loadMenu();
renderCart();