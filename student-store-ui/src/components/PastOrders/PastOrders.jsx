import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import moment from "moment"
import { api } from "../../utils/api"
import { formatPrice } from "../../utils/format"
import "./PastOrders.css"

export default function PastOrders() {
  const [orders, setOrders] = useState([])
  const [emailInput, setEmailInput] = useState("")
  const [activeEmail, setActiveEmail] = useState("")
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState(null)
  const [openOrderId, setOpenOrderId] = useState(null)
  const [openOrder, setOpenOrder] = useState(null)

  useEffect(() => {
    let cancelled = false
    setIsFetching(true)
    setError(null)
    const url = activeEmail ? `/orders?customerEmail=${encodeURIComponent(activeEmail)}` : "/orders"
    api
      .get(url)
      .then((res) => { if (!cancelled) setOrders(res.data) })
      .catch((err) => { if (!cancelled) setError(err.message || "Failed to load orders") })
      .finally(() => { if (!cancelled) setIsFetching(false) })
    return () => { cancelled = true }
  }, [activeEmail])

  useEffect(() => {
    setOpenOrder(null)
    if (openOrderId == null) return
    let cancelled = false
    api
      .get(`/orders/${openOrderId}`)
      .then((res) => { if (!cancelled) setOpenOrder(res.data) })
      .catch((err) => { if (!cancelled) setError(err.message || "Failed to load order") })
    return () => { cancelled = true }
  }, [openOrderId])

  const handleFilter = (e) => {
    e.preventDefault()
    setActiveEmail(emailInput.trim())
  }

  const handleClear = () => {
    setEmailInput("")
    setActiveEmail("")
  }

  return (
    <div className="PastOrders">
      <h2>Past Orders</h2>
      <p><Link to="/">← Back to store</Link></p>

      <form className="filter" onSubmit={handleFilter}>
        <input
          type="email"
          placeholder="filter by customer email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
        />
        <button type="submit">Filter</button>
        {activeEmail ? <button type="button" onClick={handleClear}>Clear</button> : null}
      </form>

      {isFetching ? <p>Loading…</p> : null}
      {error ? <p className="error">{String(error)}</p> : null}
      {!isFetching && !error && orders.length === 0 ? <p>No orders found.</p> : null}

      <ul className="orders">
        {orders.map((o) => (
          <li key={o.id} className="order">
            <button className="order-summary" onClick={() => setOpenOrderId(openOrderId === o.id ? null : o.id)}>
              <span>Order #{o.id}</span>
              <span>{moment(o.createdAt).format("MMM D, YYYY")}</span>
              <span>{o.status}</span>
              <span>{formatPrice(o.totalPrice)}</span>
            </button>
            {openOrderId === o.id && openOrder ? (
              <div className="order-details">
                <p>Customer: {openOrder.customerEmail || `id ${openOrder.customer}`}</p>
                <ul>
                  {openOrder.orderItems?.map((item) => (
                    <li key={item.id}>
                      {item.quantity} x {item.product?.name || `product ${item.productId}`}, {formatPrice(item.price)} each, line total {formatPrice(item.price * item.quantity)}
                    </li>
                  ))}
                </ul>
                <p><strong>Total:</strong> {formatPrice(openOrder.totalPrice)}</p>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
