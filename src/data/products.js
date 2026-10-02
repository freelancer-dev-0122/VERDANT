// /src/data/products.js
// Export 4 products and a lightweight reactive cart store using CustomEvents

export const products = [
  {
    id: 'dew-serum',
    name: 'Dew Serum',
    no: 'No. 01',
    tagline: 'Hydration Concentrate No.01',
    description: 'Deep moisture replenishment with tremella snow mushroom, cold-pressed olive squalane, and wild coastal moss.',
    price: 48,
    size: '30 ml',
    tone: 'sage'
  },
  {
    id: 'moss-cream',
    name: 'Moss Cream',
    no: 'No. 02',
    tagline: 'Barrier Recovery No.02',
    description: 'Rich cellular shield infused with sub-arctic lichens, blue tansy, and cold-milled elderberry wax.',
    price: 42,
    size: '50 ml',
    tone: 'clay'
  },
  {
    id: 'clay-cleanser',
    name: 'Clay Cleanser',
    no: 'No. 03',
    tagline: 'Purifying Emulsion No.03',
    description: 'Gentle mineral purifying milk crafted with sun-dried glacial clay, colloidal oats, and chamomile distillate.',
    price: 34,
    size: '120 ml',
    tone: 'bone'
  },
  {
    id: 'petal-mist',
    name: 'Petal Mist',
    no: 'No. 04',
    tagline: 'Botanical Essence No.04',
    description: 'Cellular toning vapor distilled from alpine rose petals, organic witch hazel hydrosol, and cucumber bio-water.',
    price: 28,
    size: '100 ml',
    tone: 'sage'
  }
];

class CartStore {
  constructor() {
    this.items = []; // array of { product, quantity }
  }

  get count() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  get subtotal() {
    return this.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }

  add(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = this.items.find(i => i.product.id === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({ product, quantity });
    }

    this._emitChange();
  }

  remove(productId, all = false) {
    const idx = this.items.findIndex(i => i.product.id === productId);
    if (idx === -1) return;

    if (all || this.items[idx].quantity <= 1) {
      this.items.splice(idx, 1);
    } else {
      this.items[idx].quantity -= 1;
    }

    this._emitChange();
  }

  clear() {
    this.items = [];
    this._emitChange();
  }

  open() {
    window.dispatchEvent(new CustomEvent('cart:open'));
  }

  _emitChange() {
    window.dispatchEvent(new CustomEvent('cart:change', {
      detail: {
        items: [...this.items],
        count: this.count,
        subtotal: this.subtotal
      }
    }));
  }
}

export const cart = new CartStore();
