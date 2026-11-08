import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  ShoppingBag,
  ShieldCheck,
  LockKeyhole,
  Check,
  Eye,
  EyeOff,
  ChevronDown,
} from 'lucide-react';
const emptyPayment = { cardholder: '', number: '', expiration: '', cvv: '' };
export default function CardAutofillDemo({
  unlocked,
  items,
  onUnlock,
  onCreate,
}) {
  const [payment, setPayment] = useState(emptyPayment),
    [picker, setPicker] = useState(false),
    [showNumber, setShowNumber] = useState(false),
    [showCode, setShowCode] = useState(false),
    [filled, setFilled] = useState(false),
    [complete, setComplete] = useState(false);
  const cards = items.filter(
    (i) =>
      i.type === 'Wallet' && i.kind !== 'account' && i.values['Card number'],
  );
  function clear() {
    setPayment({ ...emptyPayment });
    setPicker(false);
    setShowNumber(false);
    setShowCode(false);
    setFilled(false);
    setComplete(false);
  }
  useEffect(() => {
    if (!unlocked) {
      setPayment({ ...emptyPayment });
      setPicker(false);
      setShowNumber(false);
      setShowCode(false);
      setFilled(false);
      setComplete(false);
    }
  }, [unlocked]);
  function fill(card) {
    setPayment({
      cardholder: card.values.Cardholder || '',
      number: card.values['Card number'] || '',
      expiration: card.values.Expiration || '',
      cvv: card.values['CVV/CVC'] || '',
    });
    setPicker(false);
    setShowNumber(false);
    setShowCode(false);
    setFilled(true);
    setComplete(false);
  }
  function update(field, value) {
    setPayment((p) => ({ ...p, [field]: value }));
    setFilled(false);
  }
  return (
    <div className="checkout-demo">
      <div className="platform-intro">
        <span className="demo-pill">
          <ShieldCheck size={15} /> Wallet autofill practice
        </span>
        <h2>Your saved card. A faster checkout.</h2>
        <p>Select a card from your vault to fill a sample payment form.</p>
        <p className="fine">
          Local demonstration only. No payment is processed and no card details
          are sent.
        </p>
      </div>
      <div className="checkout-layout">
        <section className="checkout-summary">
          <span className="checkout-store">
            <ShoppingBag size={24} /> Demo Shop
          </span>
          <h2>Order summary</h2>
          <div className="checkout-product">
            <span>
              <ShoppingBag size={38} />
            </span>
            <div>
              <b>Everyday backpack</b>
              <p>Sample product · Quantity 1</p>
            </div>
          </div>
          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd>$24.00</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>Free</dd>
            </div>
            <div className="checkout-total">
              <dt>Demo total</dt>
              <dd>$24.00</dd>
            </div>
          </dl>
          <div className="checkout-note">
            <ShieldCheck size={19} />
            <p>
              This is a practice checkout. Use fictional card details for your
              presentation.
            </p>
          </div>
        </section>
        <section className="checkout-payment">
          <div className="checkout-payment-heading">
            <CreditCard size={24} />
            <div>
              <h2>Payment details</h2>
              <p>Fill securely from your unlocked wallet</p>
            </div>
          </div>
          {complete ? (
            <div className="checkout-complete" role="status">
              <Check size={42} />
              <h3>Demo checkout complete</h3>
              <p>No payment was processed and no card details were sent.</p>
              <button className="primary" onClick={clear}>
                Try another card
              </button>
            </div>
          ) : (
            <>
              <div className="checkout-wallet">
                <button
                  className="checkout-wallet-toggle"
                  aria-expanded={picker}
                  aria-controls="checkout-card-picker"
                  onClick={() => setPicker(!picker)}
                >
                  <ShieldCheck size={20} />
                  {!unlocked
                    ? 'Unlock to use a saved card'
                    : 'Choose a saved card'}
                  <ChevronDown size={18} />
                </button>
                {picker && (
                  <div
                    id="checkout-card-picker"
                    className="checkout-card-picker"
                  >
                    {!unlocked ? (
                      <button onClick={onUnlock}>
                        <LockKeyhole size={18} />
                        Unlock vault
                      </button>
                    ) : cards.length ? (
                      cards.map((card) => (
                        <button
                          key={card.id}
                          aria-label={'Use card ' + card.values.Title}
                          onClick={() => fill(card)}
                        >
                          <CreditCard size={24} />
                          <span>
                            <b>{card.values.Title}</b>
                            <small>
                              ••••{' '}
                              {String(card.values['Card number'])
                                .replace(/\s/g, '')
                                .slice(-4)}
                            </small>
                          </span>
                          <span className="checkout-use">Use card</span>
                        </button>
                      ))
                    ) : (
                      <div className="checkout-no-cards">
                        <p>
                          No saved cards yet. Bank accounts are not used for
                          this demo.
                        </p>
                        <button onClick={onCreate}>Add a card</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <form
                autoComplete="off"
                onSubmit={(e) => {
                  e.preventDefault();
                  setComplete(true);
                  setPayment({ ...emptyPayment });
                  setFilled(false);
                  setPicker(false);
                  setShowNumber(false);
                  setShowCode(false);
                }}
              >
                <label>
                  Name on card
                  <input
                    aria-label="Checkout cardholder"
                    required
                    autoComplete="off"
                    value={payment.cardholder}
                    onChange={(e) => update('cardholder', e.target.value)}
                  />
                </label>
                <label>
                  Card number
                  <div className="checkout-secret">
                    <input
                      aria-label="Checkout card number"
                      required
                      type={showNumber ? 'text' : 'password'}
                      inputMode="numeric"
                      autoComplete="off"
                      value={payment.number}
                      onChange={(e) => update('number', e.target.value)}
                    />
                    <button
                      type="button"
                      aria-label={
                        showNumber
                          ? 'Hide checkout card number'
                          : 'Show checkout card number'
                      }
                      onClick={() => setShowNumber(!showNumber)}
                    >
                      {showNumber ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>
                </label>
                <div className="checkout-field-row">
                  <label>
                    Expiration
                    <input
                      aria-label="Checkout expiration"
                      type="month"
                      required
                      autoComplete="off"
                      value={payment.expiration}
                      onChange={(e) => update('expiration', e.target.value)}
                    />
                  </label>
                  <label>
                    Security code
                    <div className="checkout-secret">
                      <input
                        aria-label="Checkout security code"
                        required
                        type={showCode ? 'text' : 'password'}
                        inputMode="numeric"
                        autoComplete="off"
                        value={payment.cvv}
                        onChange={(e) => update('cvv', e.target.value)}
                      />
                      <button
                        type="button"
                        aria-label={
                          showCode
                            ? 'Hide checkout security code'
                            : 'Show checkout security code'
                        }
                        onClick={() => setShowCode(!showCode)}
                      >
                        {showCode ? <EyeOff size={19} /> : <Eye size={19} />}
                      </button>
                    </div>
                  </label>
                </div>
                {filled && (
                  <p className="checkout-filled" role="status">
                    <Check size={16} />
                    Filled from your unlocked vault. Complete any missing
                    fields.
                  </p>
                )}
                <button
                  className="primary checkout-submit"
                  disabled={!unlocked}
                >
                  Complete demo checkout
                </button>
              </form>
              <div className="checkout-actions">
                <button onClick={clear}>Clear payment form</button>
                {!unlocked ? (
                  <button onClick={onUnlock}>Unlock vault</button>
                ) : (
                  <button onClick={onCreate}>Add a card</button>
                )}
              </div>
              <p className="checkout-privacy">
                <LockKeyhole size={13} />
                Your card PIN is never used in this checkout.
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
