document.addEventListener('DOMContentLoaded', () => {
  const yearTarget = document.getElementById('year');

  if (yearTarget) {
    yearTarget.textContent = new Date().getFullYear();
  }

  const categoryButtons = document.querySelectorAll('.chip');

  categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      categoryButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
    });
  });

  const cartKey = 'campusEatsCart';
  const cartCount = document.querySelector('.cart-count');
  const cartButton = document.querySelector('.cart-button');
  const cartPanel = document.getElementById('cart-panel');
  const cartCloseButton = document.querySelector('.cart-close');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const checkoutButton = document.querySelector('.cart-checkout');
  const addToCartButtons = document.querySelectorAll('[data-add-to-cart]');

  const getStoredCart = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(cartKey) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  };

  const saveCart = (cart) => {
    localStorage.setItem(cartKey, JSON.stringify(cart));
  };

  let cart = getStoredCart();

  const formatPrice = (price) => `Rs. ${price}`;

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const getGrandTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const renderCart = () => {
    const itemCount = getTotalItems();
    cartCount.textContent = String(itemCount);
    cartCount.setAttribute('aria-label', `${itemCount} item${itemCount === 1 ? '' : 's'} in cart`);

    if (!cart.length) {
      cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
      cartTotal.textContent = 'Rs. 0';
      checkoutButton.disabled = true;
      checkoutButton.setAttribute('aria-disabled', 'true');
      return;
    }

    cartItemsContainer.innerHTML = cart
      .map(
        (item) => `
          <div class="cart-item" data-name="${item.name}">
            <div class="cart-item-copy">
              <h3>${item.name}</h3>
              <p>${formatPrice(item.price)}</p>
            </div>
            <div class="cart-item-actions">
              <div class="quantity-controls" aria-label="Quantity controls for ${item.name}">
                <button
                  type="button"
                  class="quantity-button"
                  data-action="decrease"
                  data-name="${item.name}"
                  aria-label="Decrease quantity of ${item.name}"
                >
                  −
                </button>
                <span class="quantity-value" aria-live="polite">${item.quantity}</span>
                <button
                  type="button"
                  class="quantity-button"
                  data-action="increase"
                  data-name="${item.name}"
                  aria-label="Increase quantity of ${item.name}"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                class="remove-button"
                data-action="remove"
                data-name="${item.name}"
                aria-label="Remove ${item.name} from cart"
              >
                Remove
              </button>
            </div>
          </div>
        `
      )
      .join('');

    cartTotal.textContent = formatPrice(getGrandTotal());
    checkoutButton.disabled = false;
    checkoutButton.setAttribute('aria-disabled', 'false');
  };

  const openCart = () => {
    cartPanel.classList.add('is-open');
    cartPanel.setAttribute('aria-hidden', 'false');
    cartButton.setAttribute('aria-expanded', 'true');
  };

  const closeCart = () => {
    cartPanel.classList.remove('is-open');
    cartPanel.setAttribute('aria-hidden', 'true');
    cartButton.setAttribute('aria-expanded', 'false');
  };

  const addItemToCart = (name, price) => {
    const existingItem = cart.find((item) => item.name === name);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ name, price, quantity: 1 });
    }

    saveCart(cart);
    renderCart();
  };

  const updateQuantity = (name, amount) => {
    const existingItem = cart.find((item) => item.name === name);

    if (!existingItem) {
      return;
    }

    existingItem.quantity += amount;

    if (existingItem.quantity <= 0) {
      cart = cart.filter((item) => item.name !== name);
    }

    saveCart(cart);
    renderCart();
  };

  const removeItem = (name) => {
    cart = cart.filter((item) => item.name !== name);
    saveCart(cart);
    renderCart();
  };

  addToCartButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const name = button.dataset.name;
      const price = Number(button.dataset.price);

      if (!name || Number.isNaN(price)) {
        return;
      }

      addItemToCart(name, price);
      openCart();
    });
  });

  cartButton.addEventListener('click', () => {
    const isOpen = cartPanel.classList.contains('is-open');
    if (isOpen) {
      closeCart();
    } else {
      openCart();
    }
  });

  cartCloseButton.addEventListener('click', closeCart);

  cartPanel.addEventListener('click', (event) => {
    if (event.target === cartPanel) {
      closeCart();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && cartPanel.classList.contains('is-open')) {
      closeCart();
    }
  });

  cartItemsContainer.addEventListener('click', (event) => {
    const target = event.target.closest('button');

    if (!target) {
      return;
    }

    const { action, name } = target.dataset;

    if (!name) {
      return;
    }

    if (action === 'increase') {
      updateQuantity(name, 1);
    }

    if (action === 'decrease') {
      updateQuantity(name, -1);
    }

    if (action === 'remove') {
      removeItem(name);
    }
  });

  checkoutButton.addEventListener('click', () => {
    if (!cart.length) {
      return;
    }

    alert('Checkout is not connected to a backend yet. This is a demo cart flow.');
  });

  renderCart();
});
