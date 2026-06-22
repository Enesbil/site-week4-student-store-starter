import { formatPrice } from "../../utils/format"
import "./CheckoutSuccess.css"

const CheckoutSuccess = ({ order, setOrder }) => {
  if (!order) return null

  const handleOnClose = () => {
    setOrder(null)
  }

  return (
    <div className="CheckoutSuccess">
      <h3>
        Checkout Info{" "}
        <span className="icon button">
          <i className="material-icons md-48">fact_check</i>
        </span>
      </h3>
      <div className="card">
        <header className="card-head">
          <h4 className="card-title">Order #{order.id} placed!</h4>
        </header>
        <section className="card-body">
          <p>Status: {order.status}</p>
          <p>Total: {formatPrice(order.totalPrice)}</p>
          {order.orderItems?.length ? (
            <ul className="purchase">
              {order.orderItems.map((item) => (
                <li key={item.id}>
                  {item.quantity} x {item.product?.name || `product ${item.productId}`}
                  {", "}
                  {formatPrice(item.price * item.quantity)}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
        <footer className="card-foot">
          <button className="button is-success" onClick={handleOnClose}>
            Shop More
          </button>
        </footer>
      </div>
    </div>
  )
}

export default CheckoutSuccess
